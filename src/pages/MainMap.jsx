import React, { useState, useEffect, useCallback, useRef, useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { generateMap, TILES, SOLID_TILES } from '../utils/MapEngine'

// ─── Constantes ────────────────────────────────────────────────────────────────
const TILE_SIZE = 16;           // píxeles en canvas (tamaño GBC real)
const SCALE = 3;                // escalado total (1 tile → 48px en pantalla)
const VIEWPORT_TILES_X = 10;   // cuántos tiles se ven horizontalmente
const VIEWPORT_TILES_Y = 9;    // cuántos tiles se ven verticalmente
const VIEWPORT_W = VIEWPORT_TILES_X * TILE_SIZE * SCALE;
const VIEWPORT_H = VIEWPORT_TILES_Y * TILE_SIZE * SCALE;

// Sprite sheet layout: 4 cols × 2 rows, cada frame 256x256 (la imagen generada es 1024x512)
// Col 0=down0, 1=down1, 2=up0, 3=up1 | Row 0=arriba, 1=lados
const SPRITE_W = 256;   // ancho de cada frame en la imagen generada
const SPRITE_H = 512;   // alto de cada frame en la imagen generada

// Frames por dirección [col, row] en la sprite sheet
const SPRITE_FRAMES = {
  down:  [{ col: 0, row: 0 }, { col: 1, row: 0 }],
  up:    [{ col: 2, row: 0 }, { col: 3, row: 0 }],
  left:  [{ col: 0, row: 1 }, { col: 1, row: 1 }],
  right: [{ col: 2, row: 1 }, { col: 3, row: 1 }],
}

// Tileset layout: 4 cols × 2 rows, cada tile ~256px (imagen 1024x512)
// [col, row]: GRASS=0,0 | WATER=1,0 | TREE=2,0 | PATH=3,0 | FLOWER=0,1 | HOUSE=1,1 | WALL=2,1 | FLOOR=3,1
const TILE_SRC = {
  [TILES.GRASS]:  { col: 0, row: 0 },
  [TILES.WATER]:  { col: 1, row: 0 },
  [TILES.TREE]:   { col: 2, row: 0 },
  [TILES.PATH]:   { col: 3, row: 0 },
  [TILES.FLOWER]: { col: 0, row: 1 },
  [TILES.HOUSE]:  { col: 1, row: 1 },
  [TILES.WALL]:   { col: 2, row: 1 },
  [TILES.FLOOR]:  { col: 3, row: 1 },
}
const TILE_IMG_SIZE = 256;  // tamaño de cada tile en la imagen generada

// Definición de mapas
const MAPS = {
  pueblo_inicial:  { width: 50,  height: 50,  title: 'Pueblo Inicial' },
  mapa_espanol:    { width: 100, height: 100, title: 'Mapa de Español' },
  mapa_artes:      { width: 100, height: 100, title: 'Mapa de Artes' },
  mapa_ingles:     { width: 100, height: 100, title: 'Mapa de Inglés' },
  ciudad_maestros: { width: 100, height: 100, title: 'Ciudad de los Maestros' },
}

// ─── Hook para precargar imágenes ──────────────────────────────────────────────
function useImage(src) {
  const [img, setImg] = useState(null)
  useEffect(() => {
    const i = new Image()
    i.src = src
    i.onload = () => setImg(i)
  }, [src])
  return img
}

// ─── Componente Principal ──────────────────────────────────────────────────────
function MainMap() {
  const navigate = useNavigate()
  const { userId, authenticatedFetch } = useContext(AuthContext)
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)
  const keysHeld = useRef({})
  const moveTimer = useRef(null)

  const [player, setPlayer] = useState(null)
  const [npcs, setNpcs] = useState([])
  const [pos, setPos] = useState({ x: 25, y: 25 })
  const [dir, setDir] = useState('down')
  const [walkFrame, setWalkFrame] = useState(0)
  const [petPos, setPetPos] = useState({ x: 25, y: 24 })
  const posHistory = useRef([{ x: 25, y: 24 }])
  const [dialog, setDialog] = useState(null)
  const saveTimeout = useRef(null)

  // Imágenes precargadas
  const tilesetImg  = useImage('/tiles/tileset.png')
  const boyImg      = useImage('/sprites/boy.png')
  const girlImg     = useImage('/sprites/girl.png')

  // ─── Cargar jugador ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) { navigate('/'); return; }
    const load = async () => {
      try {
        const res = await authenticatedFetch(`/api/players/${userId}`)
        if (res.ok) {
          const data = await res.json()
          setPlayer(data)
          if (data.position && data.currentMap) {
            setPos(data.position)
            setPetPos({ x: data.position.x, y: data.position.y - 1 })
            posHistory.current = [{ x: data.position.x, y: data.position.y - 1 }]
          }
        } else { navigate('/create') }
      } catch (e) { console.error(e) }
    }
    load()
  }, [navigate])

  // ─── Cargar NPCs ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!player || player.currentMap === 'pueblo_inicial') { setNpcs([]); return; }
    fetch(`/api/npcs/${player.currentMap}`)
      .then(r => r.json()).then(d => setNpcs(d)).catch(() => {})
  }, [player?.currentMap])

  // ─── Mapa generado ───────────────────────────────────────────────────────────
  const mapGrid = useMemo(() =>
    generateMap(
      player?.currentMap || 'pueblo_inicial',
      MAPS[player?.currentMap || 'pueblo_inicial'].width,
      MAPS[player?.currentMap || 'pueblo_inicial'].height
    ), [player?.currentMap])

  // ─── Colisiones ──────────────────────────────────────────────────────────────
  const isObstacle = useCallback((nx, ny, mapName) => {
    const info = MAPS[mapName]
    if (nx < 0 || ny < 0 || nx >= info.width || ny >= info.height) return true
    return SOLID_TILES.includes(mapGrid[ny]?.[nx])
  }, [mapGrid])

  // Anti-stuck
  useEffect(() => {
    if (player && mapGrid.length > 0) {
      if (isObstacle(pos.x, pos.y, player.currentMap || 'pueblo_inicial')) {
        const cx = Math.floor(MAPS[player.currentMap || 'pueblo_inicial'].width / 2)
        const cy = Math.floor(MAPS[player.currentMap || 'pueblo_inicial'].height / 2)
        setPos({ x: cx, y: cy })
        setPetPos({ x: cx, y: cy - 1 })
        posHistory.current = [{ x: cx, y: cy - 1 }]
      }
    }
  }, [player?.currentMap, mapGrid])

  // ─── Guardado ────────────────────────────────────────────────────────────────
  const savePosition = useCallback((newPos, newMap) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    if (!userId) return
    saveTimeout.current = setTimeout(async () => {
      try {
        await authenticatedFetch(`/api/players/${userId}/position`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentMap: newMap, x: newPos.x, y: newPos.y })
        })
      } catch (e) {}
    }, 1000)
  }, [userId, authenticatedFetch])

  // ─── Transición de mapa ──────────────────────────────────────────────────────
  const transitionTo = useCallback((newMap, x, y) => {
    setPlayer(p => ({ ...p, currentMap: newMap }))
    setPos({ x, y })
    setPetPos({ x, y: y - 1 })
    posHistory.current = [{ x, y: y - 1 }]
    savePosition({ x, y }, newMap)
  }, [savePosition])

  // ─── Interacciones ───────────────────────────────────────────────────────────
  const handleInteraction = useCallback((nx, ny, mapName, currentPlayer, currentNpcs) => {
    if (mapName === 'pueblo_inicial') {
      if (nx === 25 && ny === 25) {
        setDialog({ text: "Bibliotecario Sabio: Bienvenido al Reino de los Lenguajes. Reúne las 3 insignias para viajar al norte.", type: 'info' })
        return true
      }
      if (nx === 0 && ny === 25)  { transitionTo('mapa_espanol', 50, 98); return true }
      if (nx === 49 && ny === 25) { transitionTo('mapa_artes', 50, 98); return true }
      if (nx === 25 && ny === 49) { transitionTo('mapa_ingles', 50, 98); return true }
      if (nx === 25 && ny === 0) {
        if (currentPlayer.unlockedFinalMap || (currentPlayer.badges?.espanol && currentPlayer.badges?.artes && currentPlayer.badges?.ingles)) {
          transitionTo('ciudad_maestros', 50, 98)
        } else {
          setDialog({ text: "La puerta está sellada. Necesitas las 3 Insignias.", type: 'info' })
        }
        return true
      }
    }
    const npc = currentNpcs.find(n => n.x === nx && n.y === ny)
    if (npc) {
      if (currentPlayer.completedBattles?.includes(npc.npcId)) {
        setDialog({ text: `${npc.name}: Ya tuvimos nuestro duelo. ¡Sigue avanzando!`, type: 'info' })
      } else {
        setDialog({ text: `¡Soy ${npc.name}! ¿Quieres poner a prueba tus conocimientos?`, type: 'battle', npc })
      }
      return true
    }
    if (mapName !== 'pueblo_inicial' && nx === Math.floor(MAPS[mapName].width/2) && ny === Math.floor(MAPS[mapName].height/2)) {
      const defeated = currentNpcs.filter(n => currentPlayer.completedBattles?.includes(n.npcId)).length
      if (defeated >= 35 && currentPlayer.xp >= 700) {
        setDialog({ text: "Maestro: ¡Has demostrado tu valía! ¡Prepárate para el reto final!", type: 'info' })
      } else {
        setDialog({ text: `Maestro: Aún no estás listo. Vence a 35 estudiantes (llevas ${defeated}) y consigue 700 XP.`, type: 'info' })
      }
      return true
    }
    return false
  }, [transitionTo])

  // ─── Movimiento ──────────────────────────────────────────────────────────────
  const moveRef = useRef(null)
  moveRef.current = { dialog, player, npcs, isObstacle, handleInteraction, savePosition, pos }

  const doMove = useCallback((dx, dy, newDir) => {
    const { dialog: dlg, player: pl, npcs: npcList, isObstacle: obs, handleInteraction: interact, savePosition: save } = moveRef.current
    if (dlg || !pl) return
    setDir(newDir)
    setPos(prev => {
      const nx = prev.x + dx
      const ny = prev.y + dy
      const cMap = pl.currentMap || 'pueblo_inicial'
      if (interact(nx, ny, cMap, pl, npcList)) return prev
      if (obs(nx, ny, cMap)) return prev
      const next = { x: nx, y: ny }
      posHistory.current.push(prev)
      if (posHistory.current.length > 1) setPetPos(posHistory.current.shift())
      save(next, cMap)
      setWalkFrame(f => (f + 1) % 2)
      return next
    })
  }, [])

  // ─── Teclado (con repetición suave) ─────────────────────────────────────────
  useEffect(() => {
    const MOVE_DELAY = 140 // ms entre pasos

    const step = () => {
      if (keysHeld.current['ArrowUp']    || keysHeld.current['w']) doMove(0, -1, 'up')
      else if (keysHeld.current['ArrowDown']  || keysHeld.current['s']) doMove(0,  1, 'down')
      else if (keysHeld.current['ArrowLeft']  || keysHeld.current['a']) doMove(-1, 0, 'left')
      else if (keysHeld.current['ArrowRight'] || keysHeld.current['d']) doMove(1,  0, 'right')
    }

    const onKeyDown = (e) => {
      const dirs = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d']
      if (dirs.includes(e.key)) e.preventDefault()
      if (e.key === 'Enter' && moveRef.current.dialog?.type === 'info') { setDialog(null); return }
      if (!keysHeld.current[e.key]) {
        keysHeld.current[e.key] = true
        step()
        moveTimer.current = setInterval(step, MOVE_DELAY)
      }
    }
    const onKeyUp = (e) => {
      delete keysHeld.current[e.key]
      if (!Object.keys(keysHeld.current).some(k => ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(k))) {
        clearInterval(moveTimer.current)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      clearInterval(moveTimer.current)
    }
  }, [doMove])

  // ─── Canvas Renderer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current || !tilesetImg || !player) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false  // ¡pixel-perfect GBC!

    const cMap = player.currentMap || 'pueblo_inicial'
    const mapInfo = MAPS[cMap]

    // Cámara centrada en el jugador
    let camTileX = pos.x - Math.floor(VIEWPORT_TILES_X / 2)
    let camTileY = pos.y - Math.floor(VIEWPORT_TILES_Y / 2)
    camTileX = Math.max(0, Math.min(camTileX, mapInfo.width  - VIEWPORT_TILES_X))
    camTileY = Math.max(0, Math.min(camTileY, mapInfo.height - VIEWPORT_TILES_Y))

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Dibujar tiles
    for (let ty = camTileY; ty < camTileY + VIEWPORT_TILES_Y + 1 && ty < mapInfo.height; ty++) {
      for (let tx = camTileX; tx < camTileX + VIEWPORT_TILES_X + 1 && tx < mapInfo.width; tx++) {
        const tileId = mapGrid[ty]?.[tx] ?? TILES.GRASS
        const src = TILE_SRC[tileId] || TILE_SRC[TILES.GRASS]
        const sx = src.col * TILE_IMG_SIZE
        const sy = src.row * TILE_IMG_SIZE
        const dx = (tx - camTileX) * TILE_SIZE * SCALE
        const dy = (ty - camTileY) * TILE_SIZE * SCALE
        ctx.drawImage(tilesetImg, sx, sy, TILE_IMG_SIZE, TILE_IMG_SIZE, dx, dy, TILE_SIZE * SCALE, TILE_SIZE * SCALE)
      }
    }

    // Dibujar salidas en pueblo_inicial
    if (cMap === 'pueblo_inicial') {
      const exits = [
        { x: 0, y: 25, color: '#e64a4a', label: 'ES' },
        { x: 49, y: 25, color: '#4a90e2', label: 'AR' },
        { x: 25, y: 49, color: '#f5a623', label: 'EN' },
        { x: 25, y: 0,  color: '#9e9e9e', label: '👑' },
      ]
      exits.forEach(({ x, y, color, label }) => {
        const dx = (x - camTileX) * TILE_SIZE * SCALE
        const dy = (y - camTileY) * TILE_SIZE * SCALE
        if (dx < 0 || dy < 0 || dx > VIEWPORT_W || dy > VIEWPORT_H) return
        ctx.fillStyle = color
        ctx.fillRect(dx, dy, TILE_SIZE * SCALE, TILE_SIZE * SCALE)
        ctx.fillStyle = '#fff'
        ctx.font = `bold ${TILE_SIZE * SCALE * 0.5}px monospace`
        ctx.textAlign = 'center'
        ctx.fillText(label, dx + TILE_SIZE * SCALE / 2, dy + TILE_SIZE * SCALE * 0.7)
      })
    }

    // Dibujar NPCs
    npcs.forEach(npc => {
      const dx = (npc.x - camTileX) * TILE_SIZE * SCALE
      const dy = (npc.y - camTileY) * TILE_SIZE * SCALE
      if (dx < -TILE_SIZE * SCALE || dy < -TILE_SIZE * SCALE || dx > VIEWPORT_W || dy > VIEWPORT_H) return
      const isDefeated = player.completedBattles?.includes(npc.npcId)
      ctx.fillStyle = isDefeated ? '#9e9e9e' : '#ffd700'
      ctx.fillRect(dx + 2, dy + 2, TILE_SIZE * SCALE - 4, TILE_SIZE * SCALE - 4)
      ctx.font = `${TILE_SIZE * SCALE * 0.6}px sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(isDefeated ? '😵' : '🤓', dx + TILE_SIZE * SCALE / 2, dy + TILE_SIZE * SCALE * 0.75)
    })

    // Dibujar NPC Sabio y Mercader en pueblo inicial
    if (cMap === 'pueblo_inicial') {
      [[25, 25, '🧙'], [27, 25, '🏪']].forEach(([tx, ty, icon]) => {
        const dx = (tx - camTileX) * TILE_SIZE * SCALE
        const dy = (ty - camTileY) * TILE_SIZE * SCALE
        ctx.font = `${TILE_SIZE * SCALE * 0.7}px sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText(icon, dx + TILE_SIZE * SCALE / 2, dy + TILE_SIZE * SCALE * 0.8)
      })
    }

    // Dibujar Mascota
    const petDx = (petPos.x - camTileX) * TILE_SIZE * SCALE
    const petDy = (petPos.y - camTileY) * TILE_SIZE * SCALE
    ctx.font = `${TILE_SIZE * SCALE * 0.7}px sans-serif`
    ctx.textAlign = 'center'
    const petIcon = player.inventory?.equippedPet === 'pet_panda' ? '🐼' : player.inventory?.equippedPet === 'pet_dragon' ? '🐉' : player.inventory?.equippedPet === 'pet_colibri' ? '🐦' : '🐾'
    ctx.fillText(petIcon, petDx + TILE_SIZE * SCALE / 2, petDy + TILE_SIZE * SCALE * 0.85)

    // Dibujar Jugador con sprite GBC
    const spriteImg = player.character?.gender === 'girl' ? girlImg : boyImg
    const pdx = (pos.x - camTileX) * TILE_SIZE * SCALE
    const pdy = (pos.y - camTileY) * TILE_SIZE * SCALE
    if (spriteImg) {
      const frames = SPRITE_FRAMES[dir] || SPRITE_FRAMES.down
      const frame = frames[walkFrame]
      const sx = frame.col * SPRITE_W
      const sy = frame.row * SPRITE_H
      // Dibujar centrado y un poco más grande
      const drawW = TILE_SIZE * SCALE * 1.1
      const drawH = TILE_SIZE * SCALE * 1.6
      const offX = (TILE_SIZE * SCALE - drawW) / 2
      const offY = (TILE_SIZE * SCALE - drawH) + 4
      ctx.drawImage(spriteImg, sx, sy, SPRITE_W, SPRITE_H, pdx + offX, pdy + offY, drawW, drawH)
    } else {
      // Fallback emoji mientras cargan los sprites
      ctx.font = `${TILE_SIZE * SCALE * 0.8}px sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(player.character?.gender === 'girl' ? '👧' : '👦', pdx + TILE_SIZE * SCALE / 2, pdy + TILE_SIZE * SCALE * 0.85)
    }

  }, [pos, dir, walkFrame, petPos, mapGrid, npcs, tilesetImg, boyImg, girlImg, player])

  if (!player) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#1a1a2e', color: '#fff', fontFamily: 'monospace' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎮</div>
        <div>Cargando mundo...</div>
      </div>
    </div>
  )

  const cMap = player.currentMap || 'pueblo_inicial'
  const mapInfo = MAPS[cMap]
  const defeatedInMap = npcs.filter(n => player.completedBattles?.includes(n.npcId)).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#1a1a2e', fontFamily: "'Press Start 2P', monospace" }}>

      {/* HUD */}
      <div style={{ padding: '6px 12px', backgroundColor: '#0d0d1a', borderBottom: '3px solid #ffd700', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ color: '#ffd700', fontSize: '0.5rem' }}>{mapInfo.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#7fff00', fontSize: '0.45rem' }}>XP: {player.xp}</span>
          <button
            style={{ fontSize: '0.35rem', padding: '2px 6px', backgroundColor: '#ff4444', color: '#fff', border: '2px solid #ffd700', cursor: 'pointer', fontFamily: 'monospace' }}
            onClick={() => {
              const cx = Math.floor(mapInfo.width / 2)
              const cy = Math.floor(mapInfo.height / 2)
              setPos({ x: cx, y: cy })
              setPetPos({ x: cx, y: cy - 1 })
              posHistory.current = [{ x: cx, y: cy - 1 }]
            }}
          >WARP</button>
        </div>
      </div>

      {/* Canvas + overlay */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e', position: 'relative' }}>

        {/* Marco estilo GBC */}
        <div style={{
          border: '6px solid #ffd700',
          boxShadow: '0 0 0 3px #000, 0 0 30px rgba(255,215,0,0.3)',
          position: 'relative',
          imageRendering: 'pixelated'
        }}>
          <canvas
            ref={canvasRef}
            width={VIEWPORT_W}
            height={VIEWPORT_H}
            style={{ display: 'block', imageRendering: 'pixelated' }}
          />

          {/* Minimapa */}
          <div style={{
            position: 'absolute', top: '6px', right: '6px',
            width: '50px', height: '50px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            border: '2px solid #ffd700',
          }}>
            <div style={{
              position: 'absolute',
              left: `${(pos.x / mapInfo.width) * 100}%`,
              top: `${(pos.y / mapInfo.height) * 100}%`,
              width: '4px', height: '4px',
              backgroundColor: '#ff0000',
              borderRadius: '50%',
              transform: 'translate(-50%,-50%)'
            }} />
          </div>

          {/* Badges */}
          <div style={{ position: 'absolute', top: '6px', left: '6px', display: 'flex', gap: '2px' }}>
            {['espanol', 'artes', 'ingles'].map(b => (
              <div key={b} style={{
                width: '10px', height: '10px',
                backgroundColor: player.badges?.[b] ? '#ffd700' : '#333',
                border: '1px solid #ffd700',
                borderRadius: '50%'
              }} title={b} />
            ))}
          </div>
        </div>

        {/* Diálogo */}
        {dialog && (
          <div style={{
            position: 'absolute', bottom: '120px',
            left: '50%', transform: 'translateX(-50%)',
            backgroundColor: '#0d0d1a',
            border: '4px solid #ffd700',
            padding: '12px 16px',
            maxWidth: '380px', width: '90%',
            zIndex: 20,
            boxShadow: '0 0 20px rgba(255,215,0,0.4)'
          }}>
            <p style={{ color: '#fff', fontSize: '0.45rem', lineHeight: '1.8', margin: 0 }}>{dialog.text}</p>
            {dialog.type === 'info' && (
              <button className="btn-retro" style={{ marginTop: '10px', fontSize: '0.4rem', padding: '4px 10px' }} onClick={() => setDialog(null)}>Continuar ▶</button>
            )}
            {dialog.type === 'battle' && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button className="btn-retro success" style={{ fontSize: '0.4rem', padding: '4px 10px' }} onClick={() => {
                  setDialog(null)
                  navigate(`/battle?npcId=${dialog.npc.npcId}&subject=${dialog.npc.subject}&difficulty=${dialog.npc.difficulty || 1}&name=${dialog.npc.name}&isBoss=${dialog.npc.isBoss ? 'true' : 'false'}`)
                }}>¡Acepto! ⚔️</button>
                <button className="btn-retro" style={{ fontSize: '0.4rem', padding: '4px 10px' }} onClick={() => setDialog(null)}>Huir 🏃</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* D-Pad táctil */}
      <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0d0d1a', borderTop: '3px solid #ffd700', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '48px 48px 48px', gridTemplateRows: '48px 48px 48px', gap: '4px' }}>
          <div/>
          <button style={dpadStyle} onTouchStart={()=>doMove(0,-1,'up')} onClick={()=>doMove(0,-1,'up')}>▲</button>
          <div/>
          <button style={dpadStyle} onTouchStart={()=>doMove(-1,0,'left')} onClick={()=>doMove(-1,0,'left')}>◄</button>
          <div style={{ backgroundColor: '#1a1a2e', border: '2px solid #333', borderRadius: '4px' }}/>
          <button style={dpadStyle} onTouchStart={()=>doMove(1,0,'right')} onClick={()=>doMove(1,0,'right')}>►</button>
          <div/>
          <button style={dpadStyle} onTouchStart={()=>doMove(0,1,'down')} onClick={()=>doMove(0,1,'down')}>▼</button>
          <div/>
        </div>

        {/* Stats compactos */}
        <div style={{ textAlign: 'center', color: '#ffd700', fontSize: '0.35rem', lineHeight: '2' }}>
          <div>💰 {player.lingocoins} LC</div>
          {cMap !== 'pueblo_inicial' && <div>⚔️ {defeatedInMap}/50</div>}
          <button className="btn-retro" style={{ fontSize: '0.3rem', padding: '3px 6px', marginTop: '4px' }} onClick={() => navigate('/shop')}>🏪</button>
          <button className="btn-retro" style={{ fontSize: '0.3rem', padding: '3px 6px', marginTop: '4px', marginLeft: '4px' }} onClick={() => navigate('/inventory')}>🎒</button>
        </div>

        <button
          style={{ ...dpadStyle, width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#e91e63', fontSize: '0.7rem' }}
          onClick={() => { if (dialog?.type === 'info') setDialog(null) }}
        >A</button>
      </div>

    </div>
  )
}

const dpadStyle = {
  backgroundColor: '#2a2a3e',
  border: '2px solid #ffd700',
  color: '#ffd700',
  cursor: 'pointer',
  borderRadius: '4px',
  fontSize: '0.8rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  touchAction: 'manipulation',
  userSelect: 'none',
}

export default MainMap
