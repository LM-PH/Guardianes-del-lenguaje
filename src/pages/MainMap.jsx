import React, { useState, useEffect, useCallback, useRef, useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { generateMap, TILES, SOLID_TILES } from '../utils/MapEngine'

// ─── Constantes ────────────────────────────────────────────────────────────────
const TS = 48          // Tile size on screen (pixels)
const VW = 11          // Viewport tiles wide
const VH = 9           // Viewport tiles tall
const CANVAS_W = VW * TS
const CANVAS_H = VH * TS

const MAPS = {
  pueblo_inicial:  { width: 50,  height: 50,  title: 'Pueblo Inicial'        },
  mapa_espanol:    { width: 100, height: 100, title: 'Mapa de Español'       },
  mapa_artes:      { width: 100, height: 100, title: 'Mapa de Artes'         },
  mapa_ingles:     { width: 100, height: 100, title: 'Mapa de Inglés'        },
  ciudad_maestros: { width: 100, height: 100, title: 'Ciudad de los Maestros'},
}

// ─── Mapeo de skins a emoji ────────────────────────────────────────────────────
const SKIN_EMOJI = {
  skin_explorador:   '🤠',
  skin_bibliotecario:'🤓',
  skin_artista:      '🧑‍🎨',
  skin_traductor:    '🗣️',
  skin_maestro:      '🧑‍🏫',
  skin_sabio:        '🧙',
}
const PET_EMOJI = {
  // Shop pets
  pet_panda:   '🐼',
  pet_dragon:  '🐉',
  pet_colibri: '🐦',
  // Starting pets
  perrito:     '🐶',
  gatito:      '🐱',
  zorrito:     '🦊',
  conejito:    '🐰',
  'búho':      '🦉',
  buho:        '🦉',
  tortuguita:  '🐢',
  periquito:   '🦜',
}

// Emojis de estudiantes (personas reales)
const STUDENT_EMOJIS = ['👦','👧','👨','👩','🧑','👱‍♂️','👱‍♀️','🧔','🧕','👲','🙋‍♂️','🙋‍♀️']
const getStudentEmoji = (npcId) => {
  const hash = (npcId || '').split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0)
  return STUDENT_EMOJIS[Math.abs(hash) % STUDENT_EMOJIS.length]
}

// Emoji de maestro según mapa
const TEACHER_EMOJI = {
  mapa_espanol:    '👩‍🏫',
  mapa_artes:      '🧑‍🎨',
  mapa_ingles:     '👨‍🏫',
  ciudad_maestros: '🧙‍♂️',
}



// ─── Dibujado de tiles (programático, sin imágenes externas) ─────────────────
// Paleta GBC auténtica (Actualizada a vibrante GBA)
const GBC = {
  grass1: '#9ccc65', grass2: '#8bc34a', grass3: '#7cb342',
  water1: '#4fc3f7', water2: '#29b6f6', water3: '#81d4fa',
  path1:  '#ffcc80', path2:  '#ffb74d', path3:  '#ffe0b2',
  tree1:  '#33691e', tree2:  '#558b2f', tree3:  '#689f38',
  trunk:  '#5d4037',
  house1: '#ef5350', house2: '#e53935', house3: '#ffca28', housew: '#fff9c4',
  wall1:  '#9e9e9e', wall2:  '#757575', wall3:  '#e0e0e0',
  floor1: '#ffee58', floor2: '#fdd835', floor3: '#fff59d',
  flower: '#ec407a', stem:   '#4caf50',
}

function drawTile(ctx, tileId, px, py, size, tick) {
  const s = size

  switch (tileId) {
    case TILES.GRASS: {
      ctx.fillStyle = GBC.grass1; ctx.fillRect(px, py, s, s)
      ctx.fillStyle = GBC.grass2
      for (let i = 0; i < 4; i++) {
        const gx = px + ((i * 13 + 3) % (s - 4))
        const gy = py + ((i * 7  + 5) % (s - 4))
        ctx.fillRect(gx, gy, 2, 1)
        ctx.fillRect(gx + 1, gy + 1, 1, 2)
      }
      break
    }
    case TILES.WATER: {
      const wave = Math.floor(tick / 20) % 2
      ctx.fillStyle = GBC.water1; ctx.fillRect(px, py, s, s)
      ctx.fillStyle = GBC.water2
      for (let w = 0; w < 3; w++) {
        const wx = px + ((w * 16 + wave * 4) % s)
        const wy = py + w * (s / 3) + 4
        ctx.fillRect(wx, wy, 10, 2)
      }
      ctx.fillStyle = GBC.water3
      for (let w = 0; w < 2; w++) {
        const wx = px + ((w * 20 + 8 + wave * 3) % (s - 4))
        const wy = py + w * (s / 2) + 10
        ctx.fillRect(wx, wy, 6, 1)
      }
      break
    }
    case TILES.PATH: {
      ctx.fillStyle = GBC.path1; ctx.fillRect(px, py, s, s)
      ctx.fillStyle = GBC.path2
      // Piedras del camino
      ctx.fillRect(px + 2,    py + 2,    s/3 - 2, s/3 - 2)
      ctx.fillRect(px + s/3 + 2, py + 2, s/3 - 4, s/3 - 2)
      ctx.fillRect(px + 2,    py + s/3 + 2, s/3 - 2, s/3 - 4)
      ctx.fillStyle = GBC.path3
      ctx.fillRect(px + s*2/3 + 2, py + s/3 + 2, s/3 - 4, s/3 - 4)
      ctx.fillRect(px + s/3 + 2, py + s*2/3 + 2, s/3 - 2, s/3 - 4)
      break
    }
    case TILES.TREE: {
      // Base de pasto debajo del árbol
      ctx.fillStyle = GBC.grass1; ctx.fillRect(px, py, s, s)
      // Tronco marrón
      ctx.fillStyle = GBC.trunk
      ctx.fillRect(px + s*0.38, py + s*0.58, s*0.24, s*0.44)
      // Sombra de la copa
      ctx.fillStyle = 'rgba(0,80,0,0.25)'
      ctx.beginPath(); ctx.ellipse(px+s*0.52, py+s*0.48, s*0.44, s*0.4, 0, 0, Math.PI*2); ctx.fill()
      // Copa principal - capa exterior (verde oscuro)
      ctx.fillStyle = '#388e3c'
      ctx.beginPath(); ctx.arc(px+s/2, py+s*0.38, s*0.42, 0, Math.PI*2); ctx.fill()
      // Copa media (verde medio)
      ctx.fillStyle = '#66bb6a'
      ctx.beginPath(); ctx.arc(px+s/2, py+s*0.32, s*0.34, 0, Math.PI*2); ctx.fill()
      // Reflejos de luz (verde claro)
      ctx.fillStyle = '#a5d6a7'
      ctx.beginPath(); ctx.arc(px+s*0.4, py+s*0.22, s*0.16, 0, Math.PI*2); ctx.fill()
      break
    }
    case TILES.FLOWER: {
      ctx.fillStyle = GBC.grass1; ctx.fillRect(px, py, s, s)
      // 2 flores pequeñas
      ;[[0.25, 0.4],[0.65, 0.55]].forEach(([fx, fy]) => {
        ctx.fillStyle = GBC.stem;  ctx.fillRect(px+s*fx, py+s*fy, 2, s*0.3)
        ctx.fillStyle = GBC.flower; ctx.beginPath(); ctx.arc(px+s*fx+1, py+s*fy, 4, 0, Math.PI*2); ctx.fill()
        ctx.fillStyle = '#fff';    ctx.beginPath(); ctx.arc(px+s*fx+1, py+s*fy, 2, 0, Math.PI*2); ctx.fill()
      })
      break
    }
    case 10: // TILES.HOUSE
    case TILES.HOUSE: {
      const hw = s * 4;
      const hh = s * 3;
      // Pared exterior
      ctx.fillStyle = GBC.housew; ctx.fillRect(px, py, hw, hh)
      // Techo rojo grande
      ctx.fillStyle = GBC.house1; ctx.fillRect(px, py, hw, hh * 0.4)
      ctx.fillStyle = GBC.house2; ctx.fillRect(px, py, hw, hh * 0.05)
      // Borde inferior del techo en sombra
      ctx.fillStyle = '#8b0000'; ctx.fillRect(px, py + hh * 0.4, hw, 5)
      
      // Dos ventanas grandes
      ctx.fillStyle = '#546e7a'; 
      ctx.fillRect(px + hw*0.15, py + hh*0.5, hw*0.2, hh*0.25)
      ctx.fillRect(px + hw*0.65, py + hh*0.5, hw*0.2, hh*0.25)
      ctx.fillStyle = '#b3e5fc'; 
      ctx.fillRect(px + hw*0.16, py + hh*0.52, hw*0.18, hh*0.21)
      ctx.fillRect(px + hw*0.66, py + hh*0.52, hw*0.18, hh*0.21)
      
      // Puerta central (que coincide con hx+1 y hx+2 en la grilla que son HOUSE_DOOR)
      ctx.fillStyle = '#4e342e'; ctx.fillRect(px + s, py + hh*0.6, s*2, hh*0.4)
      ctx.fillStyle = '#6d4c41'; ctx.fillRect(px + s + 2, py + hh*0.62, s*2 - 4, hh*0.38)
      
      // Cartel encima de la puerta
      ctx.fillStyle = '#ffeb3b'; ctx.fillRect(px + s + s*0.2, py + hh*0.5, s*1.6, hh*0.08)
      ctx.fillStyle = '#000'; ctx.font = `bold ${s * 0.25}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('ACADEMIA', px + hw/2, py + hh*0.54)
      
      break
    }
    case TILES.HOUSE_DOOR: {
      // No dibuja nada por encima, la puerta ya la dibuja el tile HOUSE
      break
    }
    case TILES.HOUSE_EXIT: {
      ctx.fillStyle = '#795548'; ctx.fillRect(px, py, s, s)
      ctx.fillStyle = '#000'; ctx.font = `bold ${s * 0.3}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('SALIDA', px + s/2, py + s/2)
      break
    }
    case TILES.WALL: {
      ctx.fillStyle = GBC.wall1; ctx.fillRect(px, py, s, s)
      ctx.fillStyle = GBC.wall2
      // Patrón de piedras
      for (let row = 0; row < 3; row++) {
        const offset = (row % 2) * (s * 0.3)
        for (let col = 0; col < 3; col++) {
          const bx = px + offset + col * s * 0.35
          const by = py + row * (s / 3)
          ctx.fillRect(bx + 1, by + 1, s*0.32, s/3 - 2)
        }
      }
      ctx.fillStyle = GBC.wall3
      ctx.fillRect(px, py, s, 2)
      break
    }
    case TILES.FLOOR: {
      ctx.fillStyle = GBC.floor1; ctx.fillRect(px, py, s, s)
      ctx.fillStyle = GBC.floor2
      // Tablones de madera
      for (let row = 0; row < 3; row++) {
        ctx.fillRect(px, py + row * (s/3), s, 1)
      }
      ctx.fillStyle = GBC.floor3
      ctx.fillRect(px, py, s, 1)
      break
    }
    default:
      ctx.fillStyle = GBC.grass1; ctx.fillRect(px, py, s, s)
  }
}

// ─── Función para dibujar emoji grande en canvas ────────────────────────────
function drawEmoji(ctx, emoji, px, py, size) {
  ctx.font = `${size}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, px, py)
}

// ─── Hook imagen (para el sprite sheet) ───────────────────────────────────────
function useImage(src) {
  const imgRef = useRef(null)
  useEffect(() => {
    const i = new Image()
    i.src = src
    i.onload = () => { imgRef.current = i }
  }, [src])
  return imgRef
}

// ─── Componente Principal ──────────────────────────────────────────────────────
function MainMap() {
  const navigate = useNavigate()
  const { userId, authenticatedFetch } = useContext(AuthContext)
  const canvasRef = useRef(null)
  const keysHeld  = useRef({})
  const moveTimer = useRef(null)
  const tickRef   = useRef(0)
  const rafRef    = useRef(null)

  const [player, setPlayer]         = useState(null)
  const [npcs,   setNpcs]           = useState([])
  const [pos,    setPos]            = useState({ x: 25, y: 25 })
  const [dir,    setDir]            = useState('down')
  const [walkFrame, setWalkFrame]   = useState(0)
  const [isMoving, setIsMoving]     = useState(false)
  const [dialog, setDialog]         = useState(null)
  const [insideHouse, setInsideHouse] = useState(null) // null | { houseId, npcs }

  // Mascota Pikachu-style: historial de posiciones
  const PET_DELAY = 4
  const posTrail  = useRef(Array(PET_DELAY).fill({ x: 25, y: 26 }))
  const [petPos, setPetPos] = useState({ x: 25, y: 26 })
  const petBobRef = useRef(0)

  const saveTimeout = useRef(null)

  // Sprite sheets principales
  const girlImgRef = useImage('/sprites/girl.png')
  const boyImgRef = useImage('/sprites/boy.png')
  // Sprites NPC
  const librarianImgRef = useImage('/sprites/librarian.png')
  const grandmasterImgRef = useImage('/sprites/grandmaster.png')
  const shopkeeperImgRef = useImage('/sprites/shopkeeper.png')
  const studentImgRef = useImage('/sprites/student.png')
  const shopBuildingImgRef = useImage('/sprites/shop_building.png')
  // Sprites Mascotas
  const petDogImgRef = useImage('/sprites/pet_perrito.png')
  const petCatImgRef = useImage('/sprites/pet_gatito.png')
  const petFoxImgRef = useImage('/sprites/pet_zorrito.png')
  const petOwlImgRef = useImage('/sprites/pet_buho.png')

  // ─── Cargar jugador ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) { navigate('/'); return }
    authenticatedFetch(`/api/players/${userId}`)
      .then(r => r.json())
      .then(data => {
        setPlayer(data)
        if (data.position && data.currentMap) {
          const p = data.position
          setPos(p)
          const pet0 = { x: p.x, y: p.y + 1 }
          setPetPos(pet0)
          posTrail.current = Array(PET_DELAY).fill(pet0)
        }
      })
      .catch(() => navigate('/create'))
  }, [navigate])

  // ─── Cargar NPCs ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!player) { setNpcs([]); return }
    const targetMap = player.currentMap || 'pueblo_inicial'
    fetch(`/api/npcs/${targetMap}`)
      .then(r => r.json()).then(setNpcs).catch(() => {})
  }, [player?.currentMap])

  // ─── Mapa ──────────────────────────────────────────────────────────────────
  const mapGrid = useMemo(() => {
    const m = player?.currentMap || 'pueblo_inicial'
    return generateMap(m, MAPS[m].width, MAPS[m].height)
  }, [player?.currentMap])

  // ─── Colisiones ────────────────────────────────────────────────────────────
  const isObstacle = useCallback((nx, ny, mapName) => {
    const info = MAPS[mapName] || MAPS.pueblo_inicial
    if (nx < 0 || ny < 0 || nx >= info.width || ny >= info.height) return true
    return SOLID_TILES.includes(mapGrid[ny]?.[nx])
  }, [mapGrid])

  // ─── Anti-stuck ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!player || !mapGrid.length) return
    const m = player.currentMap || 'pueblo_inicial'
    if (isObstacle(pos.x, pos.y, m)) {
      const cx = Math.floor(MAPS[m].width  / 2)
      const cy = Math.floor(MAPS[m].height / 2)
      setPos({ x: cx, y: cy })
      const pet0 = { x: cx, y: cy + 1 }
      setPetPos(pet0)
      posTrail.current = Array(PET_DELAY).fill(pet0)
    }
  }, [player?.currentMap, mapGrid])

  // ─── Guardado ──────────────────────────────────────────────────────────────
  const savePosition = useCallback((newPos, newMap) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    if (!userId) return
    saveTimeout.current = setTimeout(() => {
      authenticatedFetch(`/api/players/${userId}/position`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentMap: newMap, x: newPos.x, y: newPos.y })
      }).catch(() => {})
    }, 1000)
  }, [userId, authenticatedFetch])

  // ─── Transición ────────────────────────────────────────────────────────────
  const transitionTo = useCallback((newMap, x, y) => {
    setPlayer(p => ({ ...p, currentMap: newMap }))
    setPos({ x, y })
    const pet0 = { x, y: y + 1 }
    setPetPos(pet0)
    posTrail.current = Array(PET_DELAY).fill(pet0)
    savePosition({ x, y }, newMap)
  }, [savePosition])

  // ─── Interacciones ─────────────────────────────────────────────────────────
  const handleInteraction = useCallback((nx, ny, cMap, pl, npcList) => {
    // Check doors for all maps
    const mapGrid = MAPS[cMap]?.grid
    if (mapGrid) {
      if (mapGrid[ny]?.[nx] === TILES.HOUSE_DOOR) {
        transitionTo('interior_casa', 6, 10)
        return true
      }
      if (mapGrid[ny]?.[nx] === TILES.HOUSE_EXIT) {
        transitionTo('pueblo_inicial', 18, 18) // Approximate exit
        return true
      }
    }

    if (cMap === 'pueblo_inicial') {
      if (nx === 25 && ny === 25) {
        setDialog({ text: 'Bibliotecario: Bienvenido. Reúne las 3 insignias para ir al norte.', type: 'info' })
        return true
      }
      if (nx === 27 && ny === 25) { navigate('/shop'); return true }
      if (nx === 0  && ny === Math.floor(MAPS[cMap].height/2)) { transitionTo('mapa_espanol',    Math.floor(MAPS['mapa_espanol'].width/2),   98); return true }
      if (nx === MAPS[cMap].width-1 && ny === Math.floor(MAPS[cMap].height/2)) { transitionTo('mapa_artes',   Math.floor(MAPS['mapa_artes'].width/2),    98); return true }
      if (nx === Math.floor(MAPS[cMap].width/2) && ny === MAPS[cMap].height-1) { transitionTo('mapa_ingles',  Math.floor(MAPS['mapa_ingles'].width/2),   98); return true }
      if (nx === Math.floor(MAPS[cMap].width/2) && ny === 0) {
        if (pl.unlockedFinalMap || (pl.badges?.espanol && pl.badges?.artes && pl.badges?.ingles)) {
          transitionTo('ciudad_maestros', 50, 98)
        } else {
          setDialog({ text: 'La puerta está sellada. Necesitas las 3 Insignias.', type: 'info' })
        }
        return true
      }
    }

    const npc = npcList.find(n => n.x === nx && n.y === ny)
    if (npc) {
      if (pl.completedBattles?.includes(npc.npcId)) {
        setDialog({ text: `${npc.name}: ¡Ya ganaste! Sigue adelante.`, type: 'info' })
      } else {
        setDialog({ text: `¡${npc.name} quiere desafiarte! ¿Aceptas?`, type: 'battle', npc })
      }
      return true
    }

    if (cMap !== 'pueblo_inicial') {
      const cx = Math.floor(MAPS[cMap].width  / 2)
      const cy = Math.floor(MAPS[cMap].height / 2)

      // Salida sur de vuelta al pueblo
      if (ny >= MAPS[cMap].height - 1) {
        transitionTo('pueblo_inicial', Math.floor(MAPS.pueblo_inicial.width/2), Math.floor(MAPS.pueblo_inicial.height/2))
        return true
      }

      if (nx === cx && ny === cy) {
        const def = npcList.filter(n => pl.completedBattles?.includes(n.npcId)).length
        if (def >= 35 && pl.xp >= 700) {
          const teacherName = cMap === 'ciudad_maestros' ? 'Gran Maestro' : 'Maestro'
          setDialog({ text: `¡${teacherName}: Has demostrado tu valía! ¡Prepárate para el reto final!`, type: 'info' })
        } else {
          setDialog({ text: `Maestro: Necesitas 35 victorias (tienes ${def}) y 700 XP (tienes ${pl.xp}).`, type: 'info' })
        }
        return true
      }
    }
    return false
  }, [transitionTo, navigate])

  // ─── Movimiento ────────────────────────────────────────────────────────────
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
      const m  = pl.currentMap || 'pueblo_inicial'
      if (interact(nx, ny, m, pl, npcList)) { setIsMoving(false); return prev }
      if (obs(nx, ny, m)) { setIsMoving(false); return prev }
      // Actualizar trail de la mascota
      posTrail.current.push({ ...prev })
      if (posTrail.current.length > PET_DELAY) posTrail.current.shift()
      setPetPos({ ...posTrail.current[0] })
      save({ x: nx, y: ny }, m)
      setWalkFrame(f => (f + 1) % 2)
      return { x: nx, y: ny }
    })
  }, [])

  // ─── Teclado ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const SPEED = 130
    const step = () => {
      const k = keysHeld.current
      if      (k.ArrowUp    || k.w) doMove(0, -1, 'up')
      else if (k.ArrowDown  || k.s) doMove(0,  1, 'down')
      else if (k.ArrowLeft  || k.a) doMove(-1, 0, 'left')
      else if (k.ArrowRight || k.d) doMove(1,  0, 'right')
      else setIsMoving(false)
    }
    const onDown = e => {
      const dirs = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d']
      if (dirs.includes(e.key)) e.preventDefault()
      if (e.key === 'Enter' && moveRef.current.dialog?.type === 'info') { setDialog(null); return }
      if (!keysHeld.current[e.key]) {
        keysHeld.current[e.key] = true; step()
        moveTimer.current = setInterval(step, SPEED)
      }
    }
    const onUp = e => {
      delete keysHeld.current[e.key]
      if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].some(k => keysHeld.current[k])) {
        clearInterval(moveTimer.current)
        setIsMoving(false)
      }
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup',   onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup',   onUp)
      clearInterval(moveTimer.current)
    }
  }, [doMove])

  // ─── Game Loop (empieza al montar, verifica canvas/player cada frame) ────────
  const stateRef = useRef({})
  stateRef.current = { pos, dir, walkFrame, isMoving, petPos, player, npcs, mapGrid, dialog }

  useEffect(() => {
    let running = true

    const loop = () => {
      if (!running) return

      tickRef.current++

      // Esperar a que el canvas y el jugador estén disponibles
      const canvas = canvasRef.current
      if (!canvas) { rafRef.current = requestAnimationFrame(loop); return }

      const { pos: p, dir: d, walkFrame: wf, isMoving: mv, petPos: pp, player: pl, npcs: npcList, mapGrid: mg } = stateRef.current
      if (!pl || !mg || !mg.length) { rafRef.current = requestAnimationFrame(loop); return }

      const ctx = canvas.getContext('2d')
      if (!ctx) { rafRef.current = requestAnimationFrame(loop); return }

      ctx.imageSmoothingEnabled = false
      const tick = tickRef.current

      const cMap  = pl.currentMap || 'pueblo_inicial'
      const info  = MAPS[cMap] || MAPS.pueblo_inicial

      // ── Cámara centrada ──
      let camX = p.x - Math.floor(VW / 2)
      let camY = p.y - Math.floor(VH / 2)
      camX = Math.max(0, Math.min(camX, info.width  - VW))
      camY = Math.max(0, Math.min(camY, info.height - VH))

      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

      // ── Tiles ──
      for (let ty = camY; ty <= camY + VH && ty < info.height; ty++) {
        for (let tx = camX; tx <= camX + VW && tx < info.width; tx++) {
          const tileId = mg[ty]?.[tx] ?? TILES.GRASS
          const px = (tx - camX) * TS
          const py = (ty - camY) * TS
          drawTile(ctx, tileId, px, py, TS, tick)
        }
      }

      // ── Helper: dibujar en un tile si está en pantalla ──
      const inView = (tx, ty) => {
        const px = (tx - camX) * TS
        const py = (ty - camY) * TS
        return { px, py, visible: px > -TS && py > -TS && px < CANVAS_W + TS && py < CANVAS_H + TS }
      }

      // ── Salidas pueblo_inicial ──
      if (cMap === 'pueblo_inicial') {
        const exits = [
          { x: 0,              y: Math.floor(info.height/2), icon: '🌹', bg: '#c0392b' },
          { x: info.width - 1, y: Math.floor(info.height/2), icon: '🎨', bg: '#2980b9' },
          { x: Math.floor(info.width/2), y: info.height - 1, icon: '🌐', bg: '#e67e22' },
          { x: Math.floor(info.width/2), y: 0,               icon: '🏆', bg: '#8e44ad' },
        ]
        exits.forEach(({ x, y, icon, bg }) => {
          const { px, py, visible } = inView(x, y)
          if (!visible) return
          ctx.fillStyle = bg
          ctx.fillRect(px, py, TS, TS)
          ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3
          ctx.strokeRect(px + 2, py + 2, TS - 4, TS - 4)
          ctx.globalAlpha = 0.3 + 0.3 * Math.sin(tick * 0.06)
          ctx.fillStyle = '#fff'; ctx.fillRect(px + 4, py + 4, TS - 8, TS - 8)
          ctx.globalAlpha = 1
          drawEmoji(ctx, icon, px + TS/2, py + TS/2, TS * 0.7)
        })
        // NPCs fijos del pueblo_inicial
        ;[
          { tx: Math.floor(info.width/2), ty: Math.floor(info.height/2), type: 'librarian' },
          { tx: Math.floor(info.width/2) + 2, ty: Math.floor(info.height/2), type: 'shop' }
        ].forEach(({tx, ty, type}) => {
          const { px, py, visible } = inView(tx, ty)
          if (!visible) return

          if (type === 'shop') {
            // Dibujar edificio de tienda usando imagen generada
            const shopImg = shopBuildingImgRef.current
            if (shopImg && (shopImg.width > 0 || shopImg.naturalWidth > 0)) {
              const bw = TS * 2.5, bh = TS * 2.8
              ctx.drawImage(shopImg, px - TS * 0.75, py - TS * 1.8, bw, bh)
            } else {
              // Fallback canvas building
              ctx.fillStyle = '#1565c0'; ctx.fillRect(px - TS * 0.5, py - TS * 1.2, TS * 2, TS * 0.7)
              ctx.fillStyle = '#bbdefb'; ctx.fillRect(px - TS * 0.5, py - TS * 0.5, TS * 2, TS * 1.5)
              ctx.fillStyle = '#fff'
              ctx.font = `bold ${TS * 0.22}px Arial`; ctx.textAlign = 'center'
              ctx.fillText('TIENDA', px + TS / 2, py - TS * 0.9)
            }
            return
          }

          // Bibliotecario
          ctx.fillStyle = 'rgba(0,0,0,0.2)'
          ctx.beginPath(); ctx.ellipse(px+TS/2, py+TS-3, TS*0.35, 4, 0, 0, Math.PI*2); ctx.fill()
          const libImg = librarianImgRef.current
          if (libImg && (libImg.width > 0 || libImg.naturalWidth > 0)) {
            const sw = libImg.width || libImg.naturalWidth
            const sh = libImg.height || libImg.naturalHeight
            // Cada frame ocupa sw/4 de ancho, sh*0.45 de alto
            const frameW = sw / 4
            const frameH = sh * 0.45
            const drawW = TS * 1.0; const drawH = TS * 1.6
            ctx.drawImage(libImg, 0, 0, frameW, frameH, px + (TS - drawW)/2, py + TS - drawH, drawW, drawH)
          }
        })
      }

      // ── Salida sur en sub-mapas de vuelta al pueblo ──
      if (cMap !== 'pueblo_inicial') {
        const portalX = Math.floor(info.width / 2)
        const portalY = info.height - 1
        const { px, py, visible } = inView(portalX, portalY)
        if (visible) {
          ctx.fillStyle = '#c0392b'
          ctx.fillRect(px - TS, py, TS * 3, TS)
          ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3
          ctx.strokeRect(px - TS + 2, py + 2, TS * 3 - 4, TS - 4)
          ctx.fillStyle = '#fff'
          ctx.font = `bold ${TS * 0.33}px monospace`
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText('🚪 SALIDA AL PUEBLO', px + TS/2, py + TS/2)
        }
      }

      // ── NPCs dinámicos (estudiantes como personas) ──
      npcList.forEach(npc => {
        // Si el NPC está en un tile sólido (árbol), buscar el tile libre más cercano
        let drawX = npc.x, drawY = npc.y
        if (mg[npc.y]?.[npc.x] !== undefined && SOLID_TILES.includes(mg[npc.y]?.[npc.x])) {
          // Buscar tile libre en espiral
          outer: for (let r = 1; r <= 5; r++) {
            for (let dy2 = -r; dy2 <= r; dy2++) {
              for (let dx2 = -r; dx2 <= r; dx2++) {
                const tx2 = npc.x + dx2, ty2 = npc.y + dy2
                if (tx2 >= 0 && ty2 >= 0 && tx2 < info.width && ty2 < info.height &&
                    !SOLID_TILES.includes(mg[ty2]?.[tx2])) {
                  drawX = tx2; drawY = ty2; break outer
                }
              }
            }
          }
        }
        const hash = (npc.name || '').split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
        const isGirl = Math.abs(hash) % 2 !== 0;
        // Usar sprite de estudiante
        const npcImg = studentImgRef.current || (isGirl ? girlImgRef.current : boyImgRef.current);
        const { px, py, visible } = inView(drawX, drawY)
        if (!visible) return
        const defeated = pl.completedBattles?.includes(npc.npcId)
        
        if (npcImg && (npcImg.width > 0 || npcImg.naturalWidth > 0)) {
          const sw = npcImg.width || npcImg.naturalWidth
          const sh = npcImg.height || npcImg.naturalHeight
          const frameW = sw / 4
          const frameH = sh * 0.45
          const animFrame = Math.floor(tick / 12) % 4
          const drawW = TS * 0.9; const drawH = TS * 1.5
          ctx.globalAlpha = defeated ? 0.35 : 1
          ctx.drawImage(npcImg, animFrame * frameW, 0, frameW, frameH, px + (TS - drawW)/2, py + TS - drawH, drawW, drawH)
          ctx.globalAlpha = 1
        } else {
          // Fallback emoji
          const studentEmoji = defeated ? '😵' : getStudentEmoji(npc.npcId)
          drawEmoji(ctx, studentEmoji, px + TS/2, py + TS/2, TS * 0.82)
        }
        const dist = Math.abs(p.x - drawX) + Math.abs(p.y - drawY)
        if (!defeated && dist <= 2) {
          ctx.fillStyle = '#ff0000'
          ctx.font = `bold ${TS * 0.45}px monospace`
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText('!', px + TS/2, py - 6)
        }
      })

      // ── Maestro en academias (con su emoji correcto) ──
      if (cMap !== 'pueblo_inicial') {
        const cx2 = Math.floor(info.width  / 2)
        const cy2 = Math.floor(info.height / 2)
        const { px, py, visible } = inView(cx2, cy2)
        if (visible) {
          const teacherEmoji = TEACHER_EMOJI[cMap] || '🧑‍🏫'
          // Halo dorado pulsante
          ctx.globalAlpha = 0.3 + 0.2 * Math.sin(tick * 0.08)
          ctx.fillStyle = '#ffd700'
          ctx.beginPath(); ctx.arc(px+TS/2, py+TS/2, TS*0.55, 0, Math.PI*2); ctx.fill()
          ctx.globalAlpha = 1
          // Sombra
          ctx.fillStyle = 'rgba(0,0,0,0.3)'
          ctx.beginPath(); ctx.ellipse(px+TS/2, py+TS-2, TS*0.38, 5, 0, 0, Math.PI*2); ctx.fill()
          const hashBoss = cMap.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
          const bossIsGirl = Math.abs(hashBoss) % 2 !== 0;
          // Usar sprite de gran maestro para el boss
          const bossImg = grandmasterImgRef.current || (bossIsGirl ? girlImgRef.current : boyImgRef.current);

          const hasBossSprite = bossImg && (bossImg.width > 0 || bossImg.naturalWidth > 0)
          if (hasBossSprite) {
            const sw = bossImg.width || bossImg.naturalWidth
            const frameW = sw / 4
            const frameH = (bossImg.height || bossImg.naturalHeight) * 0.45
            const drawW = TS * 1.15; const drawH = TS * 1.8
            ctx.drawImage(bossImg, 0, 0, frameW, frameH, px + (TS - drawW)/2, py + TS - drawH, drawW, drawH)
          } else {
            drawEmoji(ctx, teacherEmoji, px + TS/2, py + TS/2, TS * 0.9)
          }
        }
      }

      // ── Mascota (Pikachu-style) ──
      const bob = Math.sin(tick * 0.12) * 4
      const { px: petPx, py: petPy, visible: petVis } = inView(pp.x, pp.y)
      if (petVis) {
        ctx.fillStyle = 'rgba(0,0,0,0.18)'
        ctx.beginPath(); ctx.ellipse(petPx+TS/2, petPy+TS-3, TS*0.28, 3, 0, 0, Math.PI*2); ctx.fill()

        // Seleccionar sprite de mascota correcto
        const petType = pl.inventory?.equippedPet || pl.pet?.type?.toLowerCase() || pl.pet?.id?.toLowerCase() || ''
        let petSpriteImg = null
        const isFlying = petType.includes('buho') || petType.includes('búho') || petType.includes('owl') || petType.includes('periquit') || petType.includes('colib')
        if (petType.includes('perrit') || petType.includes('dog')) petSpriteImg = petDogImgRef.current
        else if (petType.includes('gatit') || petType.includes('cat')) petSpriteImg = petCatImgRef.current
        else if (petType.includes('zorrit') || petType.includes('fox')) petSpriteImg = petFoxImgRef.current
        else if (isFlying) petSpriteImg = petOwlImgRef.current
        else petSpriteImg = petDogImgRef.current // Default

        if (petSpriteImg && (petSpriteImg.width > 0 || petSpriteImg.naturalWidth > 0)) {
          const sw = petSpriteImg.width || petSpriteImg.naturalWidth
          const sh = petSpriteImg.height || petSpriteImg.naturalHeight
          const frameW = sw / 4
          // Para mascotas, usaremos dibujo en canvas para animar patitas de forma perfecta
          const flyBob = isFlying ? Math.sin(tick * 0.15) * 8 : 0
          const drawW = TS * 0.72; const drawH = TS * 0.72
          const ox = (TS - drawW) / 2
          
          ctx.save()
          ctx.translate(petPx + ox + drawW/2, petPy + TS - drawH + bob + flyBob + drawH/2)
          
          // Animar patas
          const legSwing = Math.sin(tick * 0.4) * 5
          
          if (pl.pet === 'buho') {
             // Búho
             ctx.fillStyle = '#795548'
             ctx.beginPath(); ctx.ellipse(0, 0, 12, 16, 0, 0, Math.PI*2); ctx.fill()
             // Ojos
             ctx.fillStyle = '#fff'
             ctx.beginPath(); ctx.arc(-4, -4, 4, 0, Math.PI*2); ctx.arc(4, -4, 4, 0, Math.PI*2); ctx.fill()
             ctx.fillStyle = '#000'
             ctx.beginPath(); ctx.arc(-4, -4, 2, 0, Math.PI*2); ctx.arc(4, -4, 2, 0, Math.PI*2); ctx.fill()
             // Alas
             ctx.fillStyle = '#5D4037'
             const wingBob = isFlying ? Math.sin(tick * 0.6) * 10 : 0
             ctx.beginPath(); ctx.ellipse(-14, 0 + wingBob, 4, 10, -Math.PI/6, 0, Math.PI*2); ctx.fill()
             ctx.beginPath(); ctx.ellipse(14, 0 + wingBob, 4, 10, Math.PI/6, 0, Math.PI*2); ctx.fill()
          } else if (pl.pet === 'perrito') {
             // Perro
             ctx.fillStyle = '#FFB300'
             ctx.fillRect(-10, -5, 20, 12) // cuerpo
             ctx.fillRect(-14, -12, 10, 10) // cabeza
             // Patas
             ctx.fillStyle = '#FFA000'
             ctx.fillRect(-10 + legSwing, 7, 4, 8)
             ctx.fillRect(-4 - legSwing, 7, 4, 8)
             ctx.fillRect(6 + legSwing, 7, 4, 8)
             ctx.fillRect(2 - legSwing, 7, 4, 8)
             // Orejas
             ctx.fillStyle = '#FF8F00'
             ctx.fillRect(-16, -14, 4, 6)
          } else {
             // Gato (zorrito usa color distinto)
             ctx.fillStyle = pl.pet === 'zorrito' ? '#E64A19' : '#9E9E9E'
             ctx.beginPath(); ctx.arc(-8, -8, 8, 0, Math.PI*2); ctx.fill() // cabeza
             ctx.fillRect(-6, -4, 16, 10) // cuerpo
             // Cola
             ctx.lineWidth = 3
             ctx.strokeStyle = pl.pet === 'zorrito' ? '#BF360C' : '#757575'
             ctx.beginPath(); ctx.moveTo(10, 0); ctx.quadraticCurveTo(16 + legSwing, -10, 12, -15); ctx.stroke()
             // Patas
             ctx.fillStyle = pl.pet === 'zorrito' ? '#D84315' : '#616161'
             ctx.fillRect(-6 + legSwing, 6, 3, 6)
             ctx.fillRect(0 - legSwing, 6, 3, 6)
             ctx.fillRect(7 + legSwing, 6, 3, 6)
             // Orejas puntiagudas
             ctx.beginPath(); ctx.moveTo(-14, -14); ctx.lineTo(-10, -6); ctx.lineTo(-6, -14); ctx.fill()
          }
          ctx.restore()
        }
      }

      // ── Jugador ──
      const { px: playerPx, py: playerPy } = inView(p.x, p.y)
      // Sombra
      ctx.fillStyle = 'rgba(0,0,0,0.28)'
      ctx.beginPath(); ctx.ellipse(playerPx+TS/2, playerPy+TS-2, TS*0.35, 4, 0, 0, Math.PI*2); ctx.fill()

        // Ignoramos skin de emoji y usamos el sprite sheet
        // (Podríamos borrar esta rama si ya no usaremos la skin de emoji en el mapa principal)
        const spriteImg = pl.character?.gender === 'girl' ? girlImgRef.current : boyImgRef.current
        const hasSprite = spriteImg && (spriteImg.width > 0 || spriteImg.naturalWidth > 0)
        if (hasSprite) {
          const sw = spriteImg.width || spriteImg.naturalWidth
          const sh = spriteImg.height || spriteImg.naturalHeight
          if (sw > 0 && sh > 0) {
            const frameW = sw / 4
            const frameH = sh / 2
            const FRAMES = {
              down:  [{ col: 0, row: 0 }, { col: 1, row: 0 }],
              up:    [{ col: 2, row: 0 }, { col: 3, row: 0 }],
              left:  [{ col: 0, row: 1 }, { col: 1, row: 1 }],
              right: [{ col: 2, row: 1 }, { col: 3, row: 1 }],
            }
            const frame = mv ? FRAMES[d][wf] : FRAMES[d][0]
            const drawW = TS * 0.95
            const drawH = TS * 1.55
            const ox = (TS - drawW) / 2
            const oy = TS - drawH
            ctx.drawImage(spriteImg, frame.col * frameW, frame.row * frameH, frameW, frameH,
              playerPx + ox, playerPy + oy, drawW, drawH)
          } else {
            drawEmoji(ctx, pl.character?.gender === 'girl' ? '👧' : '👦', playerPx + TS/2, playerPy + TS/2, TS * 0.88)
          }
        } else {
          // Fallback emoji mientras carga
          drawEmoji(ctx, pl.character?.gender === 'girl' ? '👧' : '👦', playerPx + TS/2, playerPy + TS/2, TS * 0.88)
        }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => { running = false; cancelAnimationFrame(rafRef.current) }
  }, []) // Arranca al montar; usa stateRef para todo

  // ─── Render ────────────────────────────────────────────────────────────────
  if (!player) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', backgroundColor:'#1a1a2e', color:'#ffd700' }}>
      <div style={{ textAlign:'center', fontFamily:"'Press Start 2P', monospace", fontSize:'0.6rem' }}>
        <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🎮</div>
        Cargando mundo...
      </div>
    </div>
  )

  const cMap    = player.currentMap || 'pueblo_inicial'
  const mapInfo = MAPS[cMap]
  const defeated = npcs.filter(n => player.completedBattles?.includes(n.npcId)).length

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', backgroundColor:'#0a0a1a', userSelect:'none' }}>

      {/* ── HUD ── */}
      <div style={{ padding:'5px 10px', backgroundColor:'#0d0d1a', borderBottom:'3px solid #ffd700', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ color:'#ffd700', fontSize:'0.38rem', fontFamily:"'Press Start 2P', monospace" }}>
          {mapInfo.title}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={{ color:'#7fff00', fontSize:'0.35rem', fontFamily:'monospace' }}>
            XP {player.xp} | 💰{player.lingocoins}
          </span>
          {['espanol','artes','ingles'].map(b => (
            <div key={b} style={{ width:'8px', height:'8px', borderRadius:'50%', backgroundColor: player.badges?.[b] ? '#ffd700' : '#333', border:'1px solid #ffd700' }} title={b} />
          ))}
          {cMap !== 'pueblo_inicial' && (
            <button
              onClick={() => transitionTo('pueblo_inicial', 25, 25)}
              style={{ fontSize:'0.3rem', padding:'2px 5px', backgroundColor:'#2980b9', color:'#fff', border:'1px solid #ffd700', cursor:'pointer', fontFamily:'monospace' }}>
              🏡 PUEBLO
            </button>
          )}
          <button
            onClick={() => {
              const cx = Math.floor(mapInfo.width/2), cy = Math.floor(mapInfo.height/2)
              setPos({ x:cx, y:cy })
              const pet0 = { x:cx, y:cy+1 }
              setPetPos(pet0); posTrail.current = Array(PET_DELAY).fill(pet0)
            }}
            style={{ fontSize:'0.3rem', padding:'2px 5px', backgroundColor:'#e74c3c', color:'#fff', border:'1px solid #ffd700', cursor:'pointer', fontFamily:'monospace' }}>
            WARP
          </button>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div style={{ flex:1, display:'flex', justifyContent:'center', alignItems:'center', backgroundColor:'#0a0a1a', position:'relative' }}>
        <div style={{ border:'5px solid #ffd700', boxShadow:'0 0 0 3px #000, 0 0 30px rgba(255,215,0,0.3)', imageRendering:'pixelated', position:'relative' }}>
          <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} style={{ display:'block', imageRendering:'pixelated' }} />

          {/* Minimapa */}
          <div style={{ position:'absolute', top:'5px', right:'5px', width:'50px', height:'50px', backgroundColor:'rgba(0,0,0,0.8)', border:'2px solid #ffd700' }}>
            <div style={{ position:'absolute', left:`${(pos.x/mapInfo.width)*100}%`, top:`${(pos.y/mapInfo.height)*100}%`, width:'4px', height:'4px', backgroundColor:'red', borderRadius:'50%', transform:'translate(-50%,-50%)' }} />
            {npcs.map(n => (
              <div key={n.npcId} style={{ position:'absolute', left:`${(n.x/mapInfo.width)*100}%`, top:`${(n.y/mapInfo.height)*100}%`, width:'2px', height:'2px', backgroundColor: player.completedBattles?.includes(n.npcId) ? '#555' : '#ffd700', borderRadius:'50%', transform:'translate(-50%,-50%)' }} />
            ))}
          </div>

          {/* Barra de progreso */}
          {cMap !== 'pueblo_inicial' && (
            <div style={{ position:'absolute', bottom:'4px', left:'4px', right:'54px', backgroundColor:'rgba(0,0,0,0.75)', border:'1px solid #ffd700', padding:'2px 5px' }}>
              <div style={{ color:'#ffd700', fontSize:'0.28rem', fontFamily:'monospace', marginBottom:'1px' }}>⚔️ {defeated}/50</div>
              <div style={{ backgroundColor:'#333', height:'4px', borderRadius:'2px' }}>
                <div style={{ backgroundColor:'#ffd700', width:`${Math.min(100,(defeated/50)*100)}%`, height:'4px', borderRadius:'2px', transition:'width 0.3s' }} />
              </div>
            </div>
          )}
        </div>

        {/* Diálogo */}
        {dialog && (
          <div style={{ position:'absolute', bottom:'105px', left:'50%', transform:'translateX(-50%)', backgroundColor:'#0d0d1a', border:'4px solid #ffd700', padding:'12px 16px', maxWidth:'380px', width:'88%', zIndex:20, boxShadow:'0 0 20px rgba(255,215,0,0.4)' }}>
            <p style={{ color:'#fff', fontSize:'0.38rem', lineHeight:'2', margin:0, fontFamily:"'Press Start 2P', monospace" }}>{dialog.text}</p>
            {dialog.type === 'info' && (
              <button className="btn-retro" style={{ marginTop:'10px', fontSize:'0.32rem', padding:'4px 10px' }} onClick={() => setDialog(null)}>▶ Continuar</button>
            )}
            {dialog.type === 'battle' && (
              <div style={{ display:'flex', gap:'8px', marginTop:'10px' }}>
                <button className="btn-retro success" style={{ fontSize:'0.32rem', padding:'4px 10px' }} onClick={() => {
                  setDialog(null)
                  navigate(`/battle?npcId=${dialog.npc.npcId}&subject=${dialog.npc.subject}&difficulty=${dialog.npc.difficulty||1}&name=${dialog.npc.name}&isBoss=${dialog.npc.isBoss?'true':'false'}`)
                }}>⚔️ ¡Acepto!</button>
                <button className="btn-retro" style={{ fontSize:'0.32rem', padding:'4px 10px' }} onClick={() => setDialog(null)}>🏃 Huir</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── D-Pad ── */}
      <div style={{ padding:'8px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', backgroundColor:'#0d0d1a', borderTop:'3px solid #ffd700' }}>
        <div style={{ display:'grid', gridTemplateColumns:'42px 42px 42px', gridTemplateRows:'42px 42px 42px', gap:'3px' }}>
          <div/><DBtn onPress={() => doMove(0,-1,'up')}>▲</DBtn><div/>
          <DBtn onPress={() => doMove(-1,0,'left')}>◄</DBtn>
          <div style={{ backgroundColor:'#1a1a2e', border:'2px solid #333', borderRadius:'4px' }}/>
          <DBtn onPress={() => doMove(1,0,'right')}>►</DBtn>
          <div/><DBtn onPress={() => doMove(0,1,'down')}>▼</DBtn><div/>
        </div>

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'5px' }}>
          {cMap !== 'pueblo_inicial' && (
            <button className="btn-retro" style={{ fontSize:'0.28rem', padding:'4px 8px', backgroundColor:'#2980b9', color:'#fff' }} onClick={() => transitionTo('pueblo_inicial', 25, 25)}>🏡 Pueblo</button>
          )}
          <button className="btn-retro" style={{ fontSize:'0.28rem', padding:'4px 8px' }} onClick={() => navigate('/shop')}>🏪 Tienda</button>
          <button className="btn-retro" style={{ fontSize:'0.28rem', padding:'4px 8px' }} onClick={() => navigate('/inventory')}>🎒 Mochila</button>
          <button className="btn-retro" style={{ fontSize:'0.28rem', padding:'4px 8px' }} onClick={() => navigate('/profile')}>📊 Perfil</button>
        </div>

        <button
          style={{ width:'52px', height:'52px', borderRadius:'50%', backgroundColor:'#c0392b', border:'3px solid #ffd700', color:'#fff', fontSize:'1rem', cursor:'pointer', boxShadow:'0 4px 0 #922b21', fontWeight:'bold' }}
          onClick={() => { if (dialog?.type === 'info') setDialog(null) }}
        >A</button>
      </div>
    </div>
  )
}

// Botón del D-Pad con soporte táctil
function DBtn({ children, onPress }) {
  return (
    <button
      onClick={onPress}
      onPointerDown={e => { e.preventDefault(); onPress() }}
      style={{ backgroundColor:'#1a1a3e', border:'2px solid #ffd700', color:'#ffd700', cursor:'pointer', borderRadius:'6px', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center', touchAction:'manipulation', userSelect:'none', width:'100%', height:'100%', boxShadow:'0 3px 0 #a08000' }}
    >{children}</button>
  )
}

export default MainMap
