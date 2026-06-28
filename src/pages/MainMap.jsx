import React, { useState, useEffect, useCallback, useRef, useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { generateMap, TILES, SOLID_TILES } from '../utils/MapEngine'

// ─── Constantes ────────────────────────────────────────────────────────────────
const TILE_SIZE = 16;
const SCALE = 3;
const VIEWPORT_TILES_X = 10;
const VIEWPORT_TILES_Y = 9;
const VIEWPORT_W = VIEWPORT_TILES_X * TILE_SIZE * SCALE;
const VIEWPORT_H = VIEWPORT_TILES_Y * TILE_SIZE * SCALE;

// Sprite sheet: 4 cols × 2 rows en la imagen generada (1024×512)
const SPRITE_W = 256;
const SPRITE_H = 256; // cada fila mide la mitad de la imagen (512/2)
const SPRITE_FRAMES = {
  down:  [{ col: 0, row: 0 }, { col: 1, row: 0 }],
  up:    [{ col: 2, row: 0 }, { col: 3, row: 0 }],
  left:  [{ col: 0, row: 1 }, { col: 1, row: 1 }],
  right: [{ col: 2, row: 1 }, { col: 3, row: 1 }],
}

// Tileset: 4 cols × 2 rows (1024×512)
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
const TILE_IMG_W = 256;
const TILE_IMG_H = 256;

const MAPS = {
  pueblo_inicial:  { width: 50,  height: 50,  title: 'Pueblo Inicial' },
  mapa_espanol:    { width: 100, height: 100, title: 'Mapa de Español' },
  mapa_artes:      { width: 100, height: 100, title: 'Mapa de Artes' },
  mapa_ingles:     { width: 100, height: 100, title: 'Mapa de Inglés' },
  ciudad_maestros: { width: 100, height: 100, title: 'Ciudad de los Maestros' },
}

// ─── Quitar fondo blanco de un sprite (crea canvas con transparencia) ──────────
function removeWhiteBg(img) {
  const offscreen = document.createElement('canvas')
  offscreen.width = img.width
  offscreen.height = img.height
  const ctx = offscreen.getContext('2d')
  ctx.drawImage(img, 0, 0)
  const data = ctx.getImageData(0, 0, img.width, img.height)
  const d = data.data
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i+1], b = d[i+2]
    // Si el píxel es blanco o casi blanco → transparente
    if (r > 220 && g > 220 && b > 220) {
      d[i+3] = 0
    }
  }
  ctx.putImageData(data, 0, 0)
  return offscreen
}

// ─── Hook para cargar imagen y quitarle el fondo blanco ────────────────────────
function useSpriteImage(src) {
  const [canvas, setCanvas] = useState(null)
  useEffect(() => {
    const img = new Image()
    img.src = src
    img.onload = () => setCanvas(removeWhiteBg(img))
  }, [src])
  return canvas
}

// ─── Hook imagen simple (tileset sin transparencia) ───────────────────────────
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
  const keysHeld = useRef({})
  const moveTimer = useRef(null)

  const [player, setPlayer] = useState(null)
  const [npcs, setNpcs] = useState([])
  const [pos, setPos] = useState({ x: 25, y: 25 })
  const [dir, setDir] = useState('down')
  const [walkFrame, setWalkFrame] = useState(0)
  const [isMoving, setIsMoving] = useState(false)
  
  // Historial de posiciones para la mascota (Pikachu-style: sigue al jugador)
  const PET_TRAIL_LENGTH = 3
  const posTrail = useRef(Array(PET_TRAIL_LENGTH).fill({ x: 25, y: 24 }))
  const [petPos, setPetPos] = useState({ x: 25, y: 24 })
  const [petBob, setPetBob] = useState(0) // animación de rebote
  
  const [dialog, setDialog] = useState(null)
  const saveTimeout = useRef(null)
  const rafRef = useRef(null)
  const petBobRef = useRef(0)

  const tilesetImg = useImage('/tiles/tileset.png')
  const boySprite  = useSpriteImage('/sprites/boy.png')
  const girlSprite = useSpriteImage('/sprites/girl.png')

  // ─── Cargar jugador ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) { navigate('/'); return }
    const load = async () => {
      try {
        const res = await authenticatedFetch(`/api/players/${userId}`)
        if (res.ok) {
          const data = await res.json()
          setPlayer(data)
          if (data.position && data.currentMap) {
            const p = data.position
            setPos(p)
            const initPet = { x: p.x, y: p.y + 1 }
            setPetPos(initPet)
            posTrail.current = Array(PET_TRAIL_LENGTH).fill(initPet)
          }
        } else { navigate('/create') }
      } catch (e) { console.error(e) }
    }
    load()
  }, [navigate])

  // ─── Cargar NPCs ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!player || player.currentMap === 'pueblo_inicial') { setNpcs([]); return }
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
    const info = MAPS[mapName] || MAPS.pueblo_inicial
    if (nx < 0 || ny < 0 || nx >= info.width || ny >= info.height) return true
    return SOLID_TILES.includes(mapGrid[ny]?.[nx])
  }, [mapGrid])

  // ─── Anti-stuck ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (player && mapGrid.length > 0) {
      const cMap = player.currentMap || 'pueblo_inicial'
      if (isObstacle(pos.x, pos.y, cMap)) {
        const cx = Math.floor(MAPS[cMap].width / 2)
        const cy = Math.floor(MAPS[cMap].height / 2)
        setPos({ x: cx, y: cy })
        const initPet = { x: cx, y: cy + 1 }
        setPetPos(initPet)
        posTrail.current = Array(PET_TRAIL_LENGTH).fill(initPet)
      }
    }
  }, [player?.currentMap, mapGrid])

  // ─── Pet bounce animation loop ───────────────────────────────────────────────
  useEffect(() => {
    let t = 0
    const loop = () => {
      t += 0.12
      petBobRef.current = Math.sin(t) * 3
      setPetBob(Math.sin(t) * 3)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

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

  // ─── Transición ──────────────────────────────────────────────────────────────
  const transitionTo = useCallback((newMap, x, y) => {
    setPlayer(p => ({ ...p, currentMap: newMap }))
    setPos({ x, y })
    const initPet = { x, y: y + 1 }
    setPetPos(initPet)
    posTrail.current = Array(PET_TRAIL_LENGTH).fill(initPet)
    savePosition({ x, y }, newMap)
  }, [savePosition])

  // ─── Interacciones ───────────────────────────────────────────────────────────
  const handleInteraction = useCallback((nx, ny, mapName, currentPlayer, currentNpcs) => {
    if (mapName === 'pueblo_inicial') {
      if (nx === 25 && ny === 25) {
        setDialog({ text: "Bibliotecario Sabio: Bienvenido al Reino de los Lenguajes. Reúne las 3 insignias para viajar al norte.", type: 'info' })
        return true
      }
      if (nx === 27 && ny === 25) { navigate('/shop'); return true }
      if (nx === 0  && ny === 25) { transitionTo('mapa_espanol', 50, 98); return true }
      if (nx === 49 && ny === 25) { transitionTo('mapa_artes',   50, 98); return true }
      if (nx === 25 && ny === 49) { transitionTo('mapa_ingles',  50, 98); return true }
      if (nx === 25 && ny === 0) {
        if (currentPlayer.unlockedFinalMap ||
            (currentPlayer.badges?.espanol && currentPlayer.badges?.artes && currentPlayer.badges?.ingles)) {
          transitionTo('ciudad_maestros', 50, 98)
        } else {
          setDialog({ text: "La puerta está sellada. Necesitas las 3 Insignias de conocimiento.", type: 'info' })
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
    if (mapName !== 'pueblo_inicial') {
      const cx = Math.floor(MAPS[mapName].width  / 2)
      const cy = Math.floor(MAPS[mapName].height / 2)
      if (nx === cx && ny === cy) {
        const defeated = currentNpcs.filter(n => currentPlayer.completedBattles?.includes(n.npcId)).length
        if (defeated >= 35 && currentPlayer.xp >= 700) {
          setDialog({ text: "Maestro: ¡Has demostrado tu valía! ¡Prepárate para el reto final!", type: 'info' })
        } else {
          setDialog({ text: `Maestro: Aún no estás listo. Vence 35 estudiantes (llevas ${defeated}) y consigue 700 XP.`, type: 'info' })
        }
        return true
      }
    }
    return false
  }, [transitionTo, navigate])

  // ─── Movimiento ──────────────────────────────────────────────────────────────
  const moveRef = useRef(null)
  moveRef.current = { dialog, player, npcs, isObstacle, handleInteraction, savePosition }

  const doMove = useCallback((dx, dy, newDir) => {
    const { dialog: dlg, player: pl, npcs: npcList, isObstacle: obs, handleInteraction: interact, savePosition: save } = moveRef.current
    if (dlg || !pl) return
    setDir(newDir)
    setIsMoving(true)
    setPos(prev => {
      const nx = prev.x + dx
      const ny = prev.y + dy
      const cMap = pl.currentMap || 'pueblo_inicial'
      if (interact(nx, ny, cMap, pl, npcList)) { setIsMoving(false); return prev }
      if (obs(nx, ny, cMap)) { setIsMoving(false); return prev }
      const next = { x: nx, y: ny }
      // Actualizar historial de la mascota (Pikachu trail)
      posTrail.current.push({ ...prev })
      if (posTrail.current.length > PET_TRAIL_LENGTH) posTrail.current.shift()
      setPetPos({ ...posTrail.current[0] })
      save(next, cMap)
      setWalkFrame(f => (f + 1) % 2)
      return next
    })
  }, [])

  // ─── Teclado con movimiento suave ────────────────────────────────────────────
  useEffect(() => {
    const MOVE_DELAY = 130
    const step = () => {
      const k = keysHeld.current
      if      (k['ArrowUp']    || k['w']) doMove(0, -1, 'up')
      else if (k['ArrowDown']  || k['s']) doMove(0,  1, 'down')
      else if (k['ArrowLeft']  || k['a']) doMove(-1, 0, 'left')
      else if (k['ArrowRight'] || k['d']) doMove(1,  0, 'right')
      else setIsMoving(false)
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
      const anyDir = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d']
      if (!anyDir.some(k => keysHeld.current[k])) {
        clearInterval(moveTimer.current)
        setIsMoving(false)
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
    ctx.imageSmoothingEnabled = false

    const cMap = player.currentMap || 'pueblo_inicial'
    const mapInfo = MAPS[cMap]
    const TS = TILE_SIZE * SCALE

    // ─ Cámara centrada en jugador ─
    let camX = pos.x - Math.floor(VIEWPORT_TILES_X / 2)
    let camY = pos.y - Math.floor(VIEWPORT_TILES_Y / 2)
    camX = Math.max(0, Math.min(camX, mapInfo.width  - VIEWPORT_TILES_X))
    camY = Math.max(0, Math.min(camY, mapInfo.height - VIEWPORT_TILES_Y))

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // ─ Tiles ─
    for (let ty = camY; ty < camY + VIEWPORT_TILES_Y + 1 && ty < mapInfo.height; ty++) {
      for (let tx = camX; tx < camX + VIEWPORT_TILES_X + 1 && tx < mapInfo.width; tx++) {
        const tileId = mapGrid[ty]?.[tx] ?? TILES.GRASS
        const src = TILE_SRC[tileId] ?? TILE_SRC[TILES.GRASS]
        ctx.drawImage(
          tilesetImg,
          src.col * TILE_IMG_W, src.row * TILE_IMG_H, TILE_IMG_W, TILE_IMG_H,
          (tx - camX) * TS, (ty - camY) * TS, TS, TS
        )
      }
    }

    const draw = (tx, ty, fn) => {
      const dx = (tx - camX) * TS
      const dy = (ty - camY) * TS
      if (dx < -TS || dy < -TS || dx > VIEWPORT_W + TS || dy > VIEWPORT_H + TS) return
      fn(dx, dy)
    }

    // ─ Salidas pueblo inicial ─
    if (cMap === 'pueblo_inicial') {
      const exits = [
        { x: 0,  y: 25, color: '#c0392b', label: 'ES' },
        { x: 49, y: 25, color: '#2980b9', label: 'AR' },
        { x: 25, y: 49, color: '#e67e22', label: 'EN' },
        { x: 25, y: 0,  color: '#7f8c8d', label: '👑' },
      ]
      exits.forEach(({ x, y, color, label }) => {
        draw(x, y, (dx, dy) => {
          // Dibujar portal con borde brillante
          ctx.fillStyle = color
          ctx.fillRect(dx, dy, TS, TS)
          ctx.strokeStyle = '#ffd700'
          ctx.lineWidth = 3
          ctx.strokeRect(dx + 2, dy + 2, TS - 4, TS - 4)
          ctx.fillStyle = '#fff'
          ctx.font = `bold ${TS * 0.45}px monospace`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(label, dx + TS / 2, dy + TS / 2)
        })
      })
      // NPC Sabio y Mercader
      draw(25, 25, (dx, dy) => { ctx.font = `${TS * 0.75}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🧙', dx + TS/2, dy + TS/2) })
      draw(27, 25, (dx, dy) => { ctx.font = `${TS * 0.75}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🏪', dx + TS/2, dy + TS/2) })
    }

    // ─ Maestro en Academias ─
    if (cMap !== 'pueblo_inicial') {
      const cx = Math.floor(mapInfo.width  / 2)
      const cy = Math.floor(mapInfo.height / 2)
      draw(cx, cy, (dx, dy) => {
        ctx.font = `${TS * 0.75}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('👑', dx + TS/2, dy + TS/2)
      })
    }

    // ─ NPCs ─
    npcs.forEach(npc => {
      draw(npc.x, npc.y, (dx, dy) => {
        const defeated = player.completedBattles?.includes(npc.npcId)
        // Sombra suave debajo
        ctx.fillStyle = 'rgba(0,0,0,0.25)'
        ctx.beginPath()
        ctx.ellipse(dx + TS/2, dy + TS - 4, TS*0.35, 4, 0, 0, Math.PI*2)
        ctx.fill()
        ctx.font = `${TS * 0.72}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(defeated ? '😵' : '🤓', dx + TS/2, dy + TS/2)
        // Signo ! si es cercano
        const dist = Math.abs(pos.x - npc.x) + Math.abs(pos.y - npc.y)
        if (!defeated && dist <= 2) {
          ctx.fillStyle = '#ff0000'
          ctx.font = `bold ${TS * 0.5}px monospace`
          ctx.fillText('!', dx + TS/2, dy - 4)
        }
      })
    })

    // ─ Mascota (Pikachu-style: sombra + rebote) ─
    draw(petPos.x, petPos.y, (dx, dy) => {
      const bob = petBobRef.current
      // Sombra
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.beginPath()
      ctx.ellipse(dx + TS/2, dy + TS - 3, TS * 0.3, 3, 0, 0, Math.PI*2)
      ctx.fill()
      // Pet icon flotando
      const petIcon = player.inventory?.equippedPet === 'pet_panda' ? '🐼'
        : player.inventory?.equippedPet === 'pet_dragon' ? '🐉'
        : player.inventory?.equippedPet === 'pet_colibri' ? '🐦'
        : '⭐'
      ctx.font = `${TS * 0.75}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(petIcon, dx + TS/2, dy + TS/2 + bob)
    })

    // ─ Jugador (sprite GBC sin fondo blanco) ─
    draw(pos.x, pos.y, (dx, dy) => {
      const spriteCanvas = player.character?.gender === 'girl' ? girlSprite : boySprite
      // Sombra oval debajo del personaje
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.beginPath()
      ctx.ellipse(dx + TS/2, dy + TS - 2, TS * 0.35, 4, 0, 0, Math.PI * 2)
      ctx.fill()

      if (spriteCanvas) {
        const frames = SPRITE_FRAMES[dir] || SPRITE_FRAMES.down
        const frame = isMoving ? frames[walkFrame] : frames[0]
        const sx = frame.col * SPRITE_W
        const sy = frame.row * SPRITE_H
        // Dibuja un poco más alto que el tile (como en Pokémon GBC)
        const drawH = TS * 1.5
        const drawW = TS * 1.0
        ctx.drawImage(spriteCanvas, sx, sy, SPRITE_W, SPRITE_H, dx + (TS - drawW)/2, dy - (drawH - TS) + 2, drawW, drawH)
      } else {
        // Fallback emoji
        ctx.font = `${TS * 0.8}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(player.character?.gender === 'girl' ? '👧' : '👦', dx + TS/2, dy + TS/2)
      }
    })

  }, [pos, dir, walkFrame, isMoving, petPos, petBob, mapGrid, npcs, tilesetImg, boySprite, girlSprite, player])

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (!player) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#1a1a2e', color: '#ffd700', fontFamily: 'monospace' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎮</div>
        <div style={{ fontSize: '0.7rem' }}>Cargando mundo...</div>
      </div>
    </div>
  )

  const cMap = player.currentMap || 'pueblo_inicial'
  const mapInfo = MAPS[cMap]
  const defeatedInMap = npcs.filter(n => player.completedBattles?.includes(n.npcId)).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#1a1a2e' }}>

      {/* HUD */}
      <div style={{ padding: '5px 10px', backgroundColor: '#0d0d1a', borderBottom: '3px solid #ffd700', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ color: '#ffd700', fontSize: '0.4rem', fontFamily: "'Press Start 2P', monospace" }}>
          {mapInfo.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#7fff00', fontSize: '0.35rem', fontFamily: 'monospace' }}>XP {player.xp} | 💰{player.lingocoins}</span>
          {['espanol','artes','ingles'].map(b => (
            <div key={b} style={{ width:'8px', height:'8px', borderRadius:'50%', backgroundColor: player.badges?.[b] ? '#ffd700' : '#333', border: '1px solid #ffd700' }} />
          ))}
          <button onClick={() => {
            const cx = Math.floor(mapInfo.width / 2)
            const cy = Math.floor(mapInfo.height / 2)
            setPos({ x: cx, y: cy })
            const ip = { x: cx, y: cy + 1 }
            setPetPos(ip)
            posTrail.current = Array(PET_TRAIL_LENGTH).fill(ip)
          }} style={{ fontSize: '0.3rem', padding: '2px 5px', backgroundColor: '#e74c3c', color: '#fff', border: '1px solid #ffd700', cursor: 'pointer', fontFamily: 'monospace' }}>
            WARP
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e', position: 'relative' }}>
        <div style={{ border: '5px solid #ffd700', boxShadow: '0 0 0 3px #000, 0 0 25px rgba(255,215,0,0.35)', imageRendering: 'pixelated', position: 'relative' }}>
          <canvas ref={canvasRef} width={VIEWPORT_W} height={VIEWPORT_H} style={{ display: 'block', imageRendering: 'pixelated' }} />

          {/* Minimapa */}
          <div style={{ position:'absolute', top:'6px', right:'6px', width:'48px', height:'48px', backgroundColor:'rgba(0,0,0,0.75)', border:'2px solid #ffd700' }}>
            <div style={{ position:'absolute', left:`${(pos.x/mapInfo.width)*100}%`, top:`${(pos.y/mapInfo.height)*100}%`, width:'4px', height:'4px', backgroundColor:'#ff0000', borderRadius:'50%', transform:'translate(-50%,-50%)' }} />
          </div>

          {/* Barra de progreso NPCs */}
          {cMap !== 'pueblo_inicial' && (
            <div style={{ position:'absolute', bottom:'4px', left:'4px', right:'4px', backgroundColor:'rgba(0,0,0,0.7)', border:'1px solid #ffd700', padding:'2px 4px' }}>
              <div style={{ fontSize:'0.3rem', color:'#ffd700', fontFamily:'monospace', marginBottom:'1px' }}>⚔️ {defeatedInMap}/50</div>
              <div style={{ backgroundColor:'#333', height:'4px', borderRadius:'2px' }}>
                <div style={{ backgroundColor:'#ffd700', width:`${(defeatedInMap/50)*100}%`, height:'4px', borderRadius:'2px', transition:'width 0.3s' }} />
              </div>
            </div>
          )}
        </div>

        {/* Diálogo */}
        {dialog && (
          <div style={{ position:'absolute', bottom:'110px', left:'50%', transform:'translateX(-50%)', backgroundColor:'#0d0d1a', border:'4px solid #ffd700', padding:'12px 16px', maxWidth:'380px', width:'88%', zIndex:20, boxShadow:'0 0 20px rgba(255,215,0,0.4)' }}>
            <p style={{ color:'#fff', fontSize:'0.4rem', lineHeight:'2', margin:0, fontFamily:"'Press Start 2P', monospace" }}>{dialog.text}</p>
            {dialog.type === 'info' && (
              <button className="btn-retro" style={{ marginTop:'10px', fontSize:'0.35rem', padding:'4px 10px' }} onClick={() => setDialog(null)}>▶ Continuar</button>
            )}
            {dialog.type === 'battle' && (
              <div style={{ display:'flex', gap:'8px', marginTop:'10px' }}>
                <button className="btn-retro success" style={{ fontSize:'0.35rem', padding:'4px 10px' }} onClick={() => {
                  setDialog(null)
                  navigate(`/battle?npcId=${dialog.npc.npcId}&subject=${dialog.npc.subject}&difficulty=${dialog.npc.difficulty||1}&name=${dialog.npc.name}&isBoss=${dialog.npc.isBoss?'true':'false'}`)
                }}>⚔️ ¡Acepto!</button>
                <button className="btn-retro" style={{ fontSize:'0.35rem', padding:'4px 10px' }} onClick={() => setDialog(null)}>🏃 Huir</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* D-Pad */}
      <div style={{ padding:'10px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', backgroundColor:'#0d0d1a', borderTop:'3px solid #ffd700', zIndex:10 }}>
        <div style={{ display:'grid', gridTemplateColumns:'44px 44px 44px', gridTemplateRows:'44px 44px 44px', gap:'3px' }}>
          <div/><DBtn onClick={() => doMove(0,-1,'up')}>▲</DBtn><div/>
          <DBtn onClick={() => doMove(-1,0,'left')}>◄</DBtn>
          <div style={{ background:'#1a1a2e', border:'2px solid #333', borderRadius:'4px' }}/>
          <DBtn onClick={() => doMove(1,0,'right')}>►</DBtn>
          <div/><DBtn onClick={() => doMove(0,1,'down')}>▼</DBtn><div/>
        </div>

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
          <button className="btn-retro" style={{ fontSize:'0.3rem', padding:'4px 8px' }} onClick={() => navigate('/shop')}>🏪 Tienda</button>
          <button className="btn-retro" style={{ fontSize:'0.3rem', padding:'4px 8px' }} onClick={() => navigate('/inventory')}>🎒 Mochila</button>
        </div>

        <button
          style={{ width:'54px', height:'54px', borderRadius:'50%', backgroundColor:'#e74c3c', border:'3px solid #ffd700', color:'#fff', fontSize:'1rem', cursor:'pointer', boxShadow:'0 4px 0 #922b21', fontWeight:'bold' }}
          onClick={() => { if (dialog?.type === 'info') setDialog(null) }}
        >A</button>
      </div>
    </div>
  )
}

const DBtn = ({ children, onClick }) => (
  <button
    onClick={onClick}
    onTouchStart={(e) => { e.preventDefault(); onClick() }}
    style={{ backgroundColor:'#2a2a3e', border:'2px solid #ffd700', color:'#ffd700', cursor:'pointer', borderRadius:'4px', fontSize:'0.9rem', display:'flex', alignItems:'center', justifyContent:'center', touchAction:'manipulation', userSelect:'none', width:'100%', height:'100%' }}
  >{children}</button>
)

export default MainMap
