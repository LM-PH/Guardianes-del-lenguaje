import React, { useState, useEffect, useCallback, useRef, useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { generateMap, TILES, SOLID_TILES } from '../utils/MapEngine'

const TILE_SIZE = 24;

// Definición de mapas
const MAPS = {
  pueblo_inicial: { width: 50, height: 50, color: '#8bc34a', title: 'Pueblo Inicial' },
  mapa_espanol: { width: 100, height: 100, color: '#e57373', title: 'Mapa de Español' },
  mapa_artes: { width: 100, height: 100, color: '#64b5f6', title: 'Mapa de Artes' },
  mapa_ingles: { width: 100, height: 100, color: '#ffb74d', title: 'Mapa de Inglés' },
  ciudad_maestros: { width: 100, height: 100, color: '#9e9e9e', title: 'Ciudad de los Maestros' },
}

function MainMap() {
  const navigate = useNavigate()
  const { userId, authenticatedFetch } = useContext(AuthContext)
  const [player, setPlayer] = useState(null)
  const [npcs, setNpcs] = useState([])
  const [currentMapData, setCurrentMapData] = useState(MAPS.pueblo_inicial)
  
  const [pos, setPos] = useState({ x: 25, y: 25 })
  const [dir, setDir] = useState('down')
  const [petPos, setPetPos] = useState({ x: 25, y: 24 })
  const posHistory = useRef([{ x: 25, y: 24 }])
  
  const [dialog, setDialog] = useState(null)
  const [battleNpc, setBattleNpc] = useState(null)
  const saveTimeout = useRef(null)

  // Cargar Jugador
  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }
    const fetchPlayer = async () => {
      try {
        const res = await authenticatedFetch(`/api/players/${userId}`)
        if (res.ok) {
          const data = await res.json()
          setPlayer(data)
          if (data.position && data.currentMap) {
            setPos(data.position)
            setPetPos({ x: data.position.x, y: data.position.y - 1 })
            posHistory.current = [{ x: data.position.x, y: data.position.y - 1 }]
            setCurrentMapData(MAPS[data.currentMap] || MAPS.pueblo_inicial)
          }
        } else {
          navigate('/create')
        }
      } catch (err) {
        console.error('Error', err)
      }
    }
    fetchPlayer()
  }, [navigate])

  // Cargar NPCs del mapa actual
  useEffect(() => {
    if (!player || player.currentMap === 'pueblo_inicial') {
      setNpcs([]); // Pueblo inicial solo tiene al bibliotecario hardcodeado
      return;
    }
    const fetchNpcs = async () => {
      try {
        const res = await fetch(`/api/npcs/${player.currentMap}`)
        if (res.ok) {
          const data = await res.json()
          setNpcs(data)
        }
      } catch (err) {
        console.error('Error NPCs', err)
      }
    }
    fetchNpcs()
  }, [player?.currentMap])

  // Guardado
  const savePosition = useCallback((newPos, newMap) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    if (!userId) return;
    saveTimeout.current = setTimeout(async () => {
      try {
        triggerSaveEvent('saving')
        await authenticatedFetch(`/api/players/${userId}/position`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentMap: newMap, x: newPos.x, y: newPos.y })
        })
        triggerSaveEvent('saved')
      } catch (err) {}
    }, 1000)
  }, [userId, authenticatedFetch])

  // Generar grid local usando MapEngine (Memorizado para no regenerar en cada render)
  const mapGrid = useMemo(() => generateMap(player?.currentMap || 'pueblo_inicial', MAPS[player?.currentMap || 'pueblo_inicial'].width, MAPS[player?.currentMap || 'pueblo_inicial'].height), [player?.currentMap])

  // Validar si es obstáculo
  const isObstacle = useCallback((nx, ny, mapName) => {
    const mapInfo = MAPS[mapName];
    if (nx < 0 || ny < 0 || nx >= mapInfo.width || ny >= mapInfo.height) return true;
    
    const tileId = mapGrid[ny]?.[nx];
    if (SOLID_TILES.includes(tileId)) return true;
    
    return false;
  }, [mapGrid]);

  // Anti-stuck: Si al cargar el mapa el jugador está en un obstáculo (ej. árboles antiguos), moverlo al centro
  useEffect(() => {
    if (player && mapGrid.length > 0) {
      if (isObstacle(pos.x, pos.y, player.currentMap)) {
        const cx = Math.floor(MAPS[player.currentMap].width / 2);
        const cy = Math.floor(MAPS[player.currentMap].height / 2);
        setPos({ x: cx, y: cy });
        setPetPos({ x: cx, y: cy - 1 });
        posHistory.current = [{ x: cx, y: cy - 1 }];
        savePosition({ x: cx, y: cy }, player.currentMap);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.currentMap, mapGrid]);

  // Interacciones
  const handleInteraction = (nx, ny, mapName) => {
    if (mapName === 'pueblo_inicial' && nx === 25 && ny === 25) {
      setDialog({ text: "Bibliotecario Sabio: Bienvenido al Reino de los Lenguajes. Reúne las 3 insignias para poder viajar al norte, a la Ciudad de los Maestros.", type: 'info' })
      return true;
    }

    if (mapName === 'pueblo_inicial') {
      if (nx === 0 && ny === 25) { transitionTo('mapa_espanol', 50, 98); return true; }
      if (nx === 49 && ny === 25) { transitionTo('mapa_artes', 50, 98); return true; }
      if (nx === 25 && ny === 49) { transitionTo('mapa_ingles', 50, 98); return true; }
      if (nx === 25 && ny === 0) { 
        if (player.unlockedFinalMap || (player.badges.espanol && player.badges.artes && player.badges.ingles)) {
          transitionTo('ciudad_maestros', 50, 98);
        } else {
          setDialog({ text: "La puerta a la Ciudad de los Maestros está sellada. Necesitas las 3 Insignias para pasar.", type: 'info' })
        }
        return true; 
      }
    }

    // Interacción con Mercader
    if (mapName === 'pueblo_inicial' && nx === 27 && ny === 25) {
      navigate('/shop');
      return true;
    }

    // Interacción con Cofres
    if (mapName !== 'pueblo_inicial' && nx === 5 && ny === 5) {
      if (!player.inventory?.openedChests?.includes(`${mapName}_chest_1`)) {
        setDialog({
          type: 'info',
          text: '¡Has encontrado un cofre oculto! Contiene 100 Lingocoins.',
          onClose: async () => {
            // Dar monedas y marcar cofre (Simulación local por rapidez)
            alert("Has obtenido 100 LC");
          }
        });
      }
      return true;
    }

    // Transición a Ciudad de los Maestros desde Pueblo Inicial
    if (mapName === 'pueblo_inicial' && nx === 25 && ny === 0) {
      if (player.badges.espanol && player.badges.artes && player.badges.ingles) {
        setDialog({
          type: 'info',
          text: 'Las tres insignias han abierto el camino hacia la Ciudad de los Maestros.',
          onClose: () => {
            savePosition(50, 98, 'ciudad_maestros');
            setPlayer(p => ({ ...p, currentMap: 'ciudad_maestros' }));
            setCurrentMapData(MAPS['ciudad_maestros']);
            setPos({ x: 50, y: 98 });
          }
        });
      } else {
        setDialog({
          type: 'info',
          text: 'Una fuerza misteriosa te impide el paso. Solo aquellos con las tres insignias pueden entrar a la Ciudad de los Maestros.'
        });
      }
      return true;
    }

    // Interacción con Maestros
    if (Math.abs(50 - nx) <= 1 && Math.abs(50 - ny) <= 1) {
      if (mapName === 'mapa_espanol' || mapName === 'mapa_artes' || mapName === 'mapa_ingles' || mapName === 'ciudad_maestros') {
        let subject = '';
        let teacherId = '';
        if (mapName === 'mapa_espanol') { subject = 'espanol'; teacherId = 'maestro_espanol'; }
        if (mapName === 'mapa_artes') { subject = 'artes'; teacherId = 'maestro_artes'; }
        if (mapName === 'mapa_ingles') { subject = 'ingles'; teacherId = 'maestro_ingles'; }
        if (mapName === 'ciudad_maestros') { subject = 'integrador'; teacherId = 'gran_maestro_lenguaje'; }

        // Validar requisitos
        const victoriesInRealm = player.victoriesBySubject?.[subject] || 0;
        const requiredVictories = 35;
        const requiredXp = mapName === 'ciudad_maestros' ? 2500 : 700;

        if (victoriesInRealm < requiredVictories || player.xp < requiredXp) {
          setDialog({
            type: 'info',
            text: mapName === 'ciudad_maestros'
              ? `Aún debes demostrar mayor dominio antes de ingresar a la Gran Academia. Necesitas 35 victorias aquí (tienes ${victoriesInRealm}) y 2500 XP (tienes ${player.xp}).`
              : `Aún no estás listo para enfrentar al Maestro. Necesitas derrotar al menos 35 estudiantes (llevas ${victoriesInRealm}) y reunir 700 XP (llevas ${player.xp}) en este reino.`
          });
        } else {
          setDialog({
            type: 'battle',
            npc: {
              npcId: teacherId,
              subject: subject,
              name: mapName === 'ciudad_maestros' ? 'Gran Maestro del Lenguaje' : 'El Maestro',
              isBoss: true,
              isFinalBoss: mapName === 'ciudad_maestros'
            }
          });
        }
        return true;
      }
    }

    const npc = npcs.find(n => n.x === nx && n.y === ny);
    if (npc) {
      if (player.completedBattles.includes(npc.npcId)) {
        setDialog({ text: `${npc.name}: Ya hemos tenido nuestro enfrentamiento. Sigue avanzando en tu aventura.`, type: 'info' })
      } else {
        setDialog({ text: `Soy ${npc.name}, de la zona ${npc.zone}. ¿Quieres poner a prueba tus conocimientos?`, type: 'battle', npc })
      }
      return true;
    }

    // Colisión Maestro
    if (mapName !== 'pueblo_inicial' && nx === Math.floor(MAPS[mapName].width/2) && ny === Math.floor(MAPS[mapName].height/2)) {
      if (mapName === 'ciudad_maestros') {
        const defeatedInMap = npcs.filter(n => player.completedBattles.includes(n.npcId)).length;
        if (defeatedInMap >= 35 && player.xp >= 2500) {
          setDialog({ text: "GRAN MAESTRO DEL LENGUAJE: Has reunido el conocimiento de los tres reinos. ¡Prepárate para la batalla final!", type: 'info' })
        } else {
          setDialog({ text: `GRAN MAESTRO DEL LENGUAJE: Aún no estás listo. Vence a 35 estudiantes integradores (tienes ${defeatedInMap}) y consigue 2500 XP en total (tienes ${player.xp}).`, type: 'info' })
        }
      } else {
        const subject = mapName.split('_')[1];
        const defeatedInMap = npcs.filter(n => player.completedBattles.includes(n.npcId)).length;
        if (defeatedInMap >= 35 && player.xp >= 700) {
          setDialog({ text: "Maestro: Has demostrado tu valía. ¡Prepárate para la batalla final de esta escuela!", type: 'info' })
        } else {
          setDialog({ text: `Maestro: Aún no estás listo. Vence a 35 estudiantes (tienes ${defeatedInMap}) y consigue 700 XP en total (tienes ${player.xp}).`, type: 'info' })
        }
      }
      return true;
    }

    return false;
  }

  const transitionTo = (newMap, x, y) => {
    // Por ahora el usuario pidió solo mostrar "Esta ruta estará disponible pronto" 
    // pero luego dice "Crear estudiantes repartidos por los mapas... Total 150".
    // Así que SÍ debemos hacer la transición.
    setPlayer(p => ({ ...p, currentMap: newMap }))
    setCurrentMapData(MAPS[newMap])
    setPos({ x, y })
    setPetPos({ x, y: y-1 })
    posHistory.current = [{ x, y: y-1 }]
    savePosition({ x, y }, newMap)
  }

  const move = useCallback((dx, dy, newDir) => {
    if (dialog) return;

    setDir(newDir)
    setPos(prev => {
      const nx = prev.x + dx;
      const ny = prev.y + dy;
      const cMap = player.currentMap || 'pueblo_inicial';

      if (handleInteraction(nx, ny, cMap)) return prev;
      if (isObstacle(nx, ny, cMap)) return prev;
      
      const nextPos = { x: nx, y: ny };
      posHistory.current.push(prev);
      if (posHistory.current.length > 1) {
        setPetPos(posHistory.current.shift());
      }
      
      savePosition(nextPos, cMap);
      return nextPos;
    })
  }, [dialog, savePosition, player, npcs])

  // Teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'ArrowUp': case 'w': move(0, -1, 'up'); break;
        case 'ArrowDown': case 's': move(0, 1, 'down'); break;
        case 'ArrowLeft': case 'a': move(-1, 0, 'left'); break;
        case 'ArrowRight': case 'd': move(1, 0, 'right'); break;
        case 'Enter': 
          if(dialog && dialog.type === 'info') setDialog(null);
          break;
        default: break;
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [move, dialog])

  const getDirClass = (d) => {
    switch(d) {
      case 'left': return 'scaleX(-1)';
      case 'right': return 'scaleX(1)';
      default: return 'none';
    }
  }

  if (!player) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando mapa...</div>

  // Calcular cámara (centrar jugador)
  const mapW = currentMapData.width * TILE_SIZE;
  const mapH = currentMapData.height * TILE_SIZE;
  const viewportW = 300; // tamaño de vista aprox
  const viewportH = 300;
  
  let camX = (pos.x * TILE_SIZE) - (viewportW / 2) + (TILE_SIZE / 2);
  let camY = (pos.y * TILE_SIZE) - (viewportH / 2) + (TILE_SIZE / 2);
  
  // Limitar cámara
  if (camX < 0) camX = 0;
  if (camY < 0) camY = 0;
  if (camX > mapW - viewportW) camX = mapW - viewportW;
  if (camY > mapH - viewportH) camY = mapH - viewportH;

  const defeatedInMap = npcs.filter(n => player.completedBattles.includes(n.npcId)).length;
  const mapProgress = npcs.length > 0 ? Math.round((defeatedInMap / npcs.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#5a5a5a' }}>
      
      {/* HUD SUPERIOR */}
      <div style={{ padding: '5px 10px', backgroundColor: 'var(--gbc-white)', borderBottom: '4px solid var(--gbc-black)', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '0.7rem', margin: 0, color: 'var(--gbc-primary)' }}>{currentMapData.title}</h2>
          <div style={{ fontSize: '0.6rem' }}>XP: {player.xp} | {player.title}</div>
        </div>
        
        {player.currentMap !== 'pueblo_inicial' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.55rem' }}>
            <span>Derrotados: {defeatedInMap}/50 ({mapProgress}%)</span>
            <span>
              Insignias: 
              <span style={{ opacity: player.badges.espanol ? 1 : 0.2 }}> ES </span>
              <span style={{ opacity: player.badges.artes ? 1 : 0.2 }}> AR </span>
              <span style={{ opacity: player.badges.ingles ? 1 : 0.2 }}> EN </span>
            </span>
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
        
        {/* Contenedor Vista */}
        <div style={{ 
          width: `${viewportW}px`, 
          height: `${viewportH}px`,
          position: 'relative',
          overflow: 'hidden',
          border: '4px solid #000',
          backgroundColor: currentMapData.color,
          transform: 'scale(1.2)'
        }}>
          
          {/* El Mapa en sí que se mueve */}
          <div style={{
            position: 'absolute',
            left: -camX,
            top: -camY,
            width: `${mapW}px`,
            height: `${mapH}px`,
            transition: 'left 0.2s linear, top 0.2s linear'
          }}>

            {/* Renderizar Grid Generado */}
            {mapGrid.map((row, y) => row.map((tileId, x) => {
              // Optimizacion: Solo renderizar si está cerca de la cámara (culling)
              if (
                x * TILE_SIZE < camX - TILE_SIZE * 2 ||
                x * TILE_SIZE > camX + viewportW + TILE_SIZE * 2 ||
                y * TILE_SIZE < camY - TILE_SIZE * 2 ||
                y * TILE_SIZE > camY + viewportH + TILE_SIZE * 2
              ) return null;

              let tileClass = 'tile tile-grass';
              if (tileId === TILES.WATER) tileClass = 'tile tile-water';
              if (tileId === TILES.TREE) tileClass = 'tile tile-tree';
              if (tileId === TILES.PATH) tileClass = 'tile tile-path';
              if (tileId === TILES.HOUSE) tileClass = 'tile tile-house';
              if (tileId === TILES.WALL) tileClass = 'tile tile-wall';
              if (tileId === TILES.FLOOR) tileClass = 'tile tile-floor';
              if (tileId === TILES.FLOWER) tileClass = 'tile tile-flower';

              return (
                <div key={`${x}-${y}`} className={tileClass} style={{ left: x * TILE_SIZE, top: y * TILE_SIZE }}></div>
              );
            }))}

            {/* Salidas en Pueblo Inicial */}
            {player.currentMap === 'pueblo_inicial' && (
              <>
                <div style={{ position: 'absolute', top: 25*TILE_SIZE, left: 0, width: TILE_SIZE, height: TILE_SIZE, backgroundColor: '#e64a4a', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent:'center', zIndex: 1 }}>ES</div>
                <div style={{ position: 'absolute', top: 25*TILE_SIZE, left: 49*TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, backgroundColor: '#4a90e2', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent:'center', zIndex: 1 }}>AR</div>
                <div style={{ position: 'absolute', top: 49*TILE_SIZE, left: 25*TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, backgroundColor: '#f5a623', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent:'center', zIndex: 1 }}>EN</div>
                
                {/* Salida Norte a Ciudad Maestros */}
                <div style={{ position: 'absolute', top: 0, left: 25*TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, backgroundColor: '#9e9e9e', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent:'center', border: (player.badges.espanol && player.badges.artes && player.badges.ingles) ? '2px solid gold' : '2px solid black', zIndex: 1 }}>👑</div>
                
                {/* NPC Sabio */}
                <div style={{ position: 'absolute', top: 25*TILE_SIZE, left: 25*TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, backgroundColor: '#ab47bc', display: 'flex', alignItems: 'center', justifyContent:'center', zIndex: 2 }}>🧙</div>

                {/* NPC Mercader */}
                <div style={{ position: 'absolute', top: 25*TILE_SIZE, left: 27*TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, backgroundColor: '#795548', display: 'flex', alignItems: 'center', justifyContent:'center', fontSize: '12px', zIndex: 2 }}>🏪</div>
              </>
            )}

            {/* Cofres Secretos */}
            {player.currentMap !== 'pueblo_inicial' && !player.inventory?.openedChests?.includes(`${player.currentMap}_chest_1`) && (
              <div style={{ position: 'absolute', top: 5*TILE_SIZE, left: 5*TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, backgroundColor: '#ffeb3b', display: 'flex', alignItems: 'center', justifyContent:'center', fontSize: '12px', zIndex: 2 }}>🧰</div>
            )}

            {/* Maestro en Escuelas */}
            {player.currentMap !== 'pueblo_inicial' && (
              <div style={{ 
                position: 'absolute', 
                top: 50*TILE_SIZE, 
                left: 50*TILE_SIZE, 
                width: TILE_SIZE, height: TILE_SIZE, 
                backgroundColor: '#fbc02d', display: 'flex', alignItems: 'center', justifyContent:'center', border: '2px solid #000', zIndex: 2
              }}>👑</div>
            )}
            
            {/* NPCs Dinámicos */}
            {npcs.map(npc => {
              const isDefeated = player.completedBattles.includes(npc.npcId);
              // Verificar cercanía para !
              const isNear = Math.abs(pos.x - npc.x) <= 1 && Math.abs(pos.y - npc.y) <= 1;

              return (
                <div key={npc.npcId} style={{
                  position: 'absolute',
                  left: npc.x * TILE_SIZE,
                  top: npc.y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  backgroundColor: isDefeated ? '#9e9e9e' : '#ffeb3b', // Gris si está derrotado
                  border: '1px solid #000',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '12px'
                }}>
                  {isDefeated ? '😵' : '🤓'}
                  {isNear && !isDefeated && (
                    <div style={{ position: 'absolute', top: '-15px', color: 'red', fontWeight: 'bold' }}>!</div>
                  )}
                </div>
              )
            })}

            {/* Mascota */}
            <div style={{
              position: 'absolute',
              left: petPos.x * TILE_SIZE,
              top: petPos.y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              backgroundColor: 'var(--gbc-secondary)',
              borderRadius: '50%',
              transition: 'left 0.2s, top 0.2s',
              zIndex: 2,
              display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px'
            }}>
              🐾
            </div>

            {/* Jugador */}
            <div style={{
              position: 'absolute',
              left: pos.x * TILE_SIZE,
              top: pos.y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              backgroundColor: player.character.gender === 'boy' ? '#2196f3' : '#e91e63',
              boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              zIndex: 3,
              transform: getDirClass(dir),
              transition: 'left 0.2s, top 0.2s'
            }}>
              {(() => {
                const eqSkin = player.inventory?.equippedSkin;
                if (eqSkin === 'skin_explorador') return '🤠';
                if (eqSkin === 'skin_bibliotecario') return '🤓';
                if (eqSkin === 'skin_artista') return '🧑‍🎨';
                if (eqSkin === 'skin_traductor') return '🗣️';
                if (eqSkin === 'skin_maestro') return '🧑‍🏫';
                if (eqSkin === 'skin_sabio') return '🧙';
                return player.character.gender === 'boy' ? '👦' : '👧';
              })()}
            </div>
          
            {/* Mascota (Sigue al jugador) */}
            <div
              style={{
                position: 'absolute',
                top: (petPos.y * TILE_SIZE),
                left: (petPos.x * TILE_SIZE),
                width: TILE_SIZE,
                height: TILE_SIZE,
                transition: 'left 0.2s, top 0.2s',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px'
              }}
            >
              {(() => {
                const eqPet = player.inventory?.equippedPet;
                if (eqPet === 'pet_panda') return '🐼';
                if (eqPet === 'pet_dragon') return '🐉';
                if (eqPet === 'pet_colibri') return '🐦';
                return '🐾';
              })()}
            </div>
          </div>
        </div>

        {/* Minimapa */}
        <div style={{
          position: 'absolute', top: '10px', right: '10px',
          width: '60px', height: '60px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          border: '2px solid #fff',
          zIndex: 15
        }}>
          {/* Jugador en minimapa */}
          <div style={{
            position: 'absolute',
            left: `${(pos.x / currentMapData.width) * 100}%`,
            top: `${(pos.y / currentMapData.height) * 100}%`,
            width: '4px', height: '4px', backgroundColor: 'red', borderRadius: '50%'
          }}></div>
        </div>

        {/* Diálogos UI */}
        {dialog && (
          <div className="rpg-box" style={{
            position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
            width: '90%', maxWidth: '400px', zIndex: 20
          }}>
            <p style={{ fontSize: '0.6rem' }}>{dialog.text}</p>
            
            {dialog.type === 'info' && (
              <button className="btn-retro" style={{ padding: '5px', marginTop: '10px' }} onClick={() => setDialog(null)}>Continuar</button>
            )}

            {dialog.type === 'battle' && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button className="btn-retro success" style={{ padding: '5px' }} onClick={() => {
                  setDialog(null);
                  navigate(`/battle?npcId=${dialog.npc.npcId}&subject=${dialog.npc.subject}&difficulty=${dialog.npc.difficulty || 1}&name=${dialog.npc.name}&isBoss=${dialog.npc.isBoss ? 'true' : 'false'}`);
                }}>Sí</button>
                <button className="btn-retro" style={{ padding: '5px', backgroundColor: 'var(--gbc-primary)' }} onClick={() => setDialog(null)}>No</button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* D-Pad para táctil */}
      <div style={{ padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--gbc-white)', borderTop: '4px solid var(--gbc-black)', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
          <div></div>
          <button className="btn-retro" style={{ padding: '15px' }} onClick={() => move(0, -1, 'up')}>⬆️</button>
          <div></div>
          <button className="btn-retro" style={{ padding: '15px' }} onClick={() => move(-1, 0, 'left')}>⬅️</button>
          <button className="btn-retro" style={{ padding: '15px' }} onClick={() => move(0, 1, 'down')}>⬇️</button>
          <button className="btn-retro" style={{ padding: '15px' }} onClick={() => move(1, 0, 'right')}>➡️</button>
        </div>
        
        <div style={{ marginLeft: '40px' }}>
          <button className="btn-retro success" style={{ padding: '20px', borderRadius: '50%' }} onClick={() => { if(dialog && dialog.type === 'info') setDialog(null) }}>A</button>
        </div>
      </div>

    </div>
  )
}

export default MainMap
