import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

function Profile() {
  const navigate = useNavigate()
  const { userId, authenticatedFetch, logout } = useContext(AuthContext)
  const [player, setPlayer] = useState(null)

  useEffect(() => {
    if (!userId) {
      navigate('/')
      return
    }
    const fetchPlayer = async () => {
      try {
        const res = await authenticatedFetch(`/api/players/${userId}`)
        if (res.ok) {
          const data = await res.json()
          setPlayer(data)
        } else {
          navigate('/')
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchPlayer()
  }, [userId, navigate, authenticatedFetch])

  if (!player) return <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>Cargando pasaporte avanzado...</div>

  // Calcular porcentaje completado general (aprox)
  // 150 estudiantes + 3 maestros + 3 insignias + 10 logros = 166 elementos "desbloqueables" iniciales
  const totalStudents = 150;
  const currentStudents = player.completedBattles?.length || 0;
  const totalBadges = 3;
  const currentBadges = (player.badges?.espanol ? 1:0) + (player.badges?.artes ? 1:0) + (player.badges?.ingles ? 1:0);
  const totalTeachers = 3;
  const currentTeachers = player.defeatedTeachers?.length || 0;
  
  const completionPercentage = Math.round(((currentStudents + currentBadges + currentTeachers) / (totalStudents + totalBadges + totalTeachers)) * 100);

  const ACHIEVEMENTS_LIST = [
    { id: 'first_battle', name: 'Primer Combate', icon: '⚔️' },
    { id: 'win_10', name: 'Derrotar 10 estudiantes', icon: '🥉' },
    { id: 'win_50', name: 'Derrotar 50 estudiantes', icon: '🥈' },
    { id: 'win_100', name: 'Derrotar 100 estudiantes', icon: '🥇' },
    { id: 'win_200', name: 'Derrotar 200 estudiantes', icon: '🏆' },
    { id: 'first_badge', name: 'Primera Insignia', icon: '🎖️' },
    { id: 'three_badges', name: 'Tres Insignias', icon: '🌟' },
    { id: 'first_teacher', name: 'Primer Maestro Derrotado', icon: '👑' },
    { id: 'perfect_streak_10', name: 'Racha Perfecta (10)', icon: '🔥' },
    { id: 'pronunciation_master', name: 'Maestro de la Pronunciación', icon: '🎤' }
  ];

  const hasAchievement = (id) => player.achievements?.some(a => a.id === id);

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', backgroundColor: '#2b2b2b', color: '#fff', minHeight: '100vh', overflowY: 'auto' }}>
      
      {/* 1. IDENTIDAD */}
      <div className="rpg-box" style={{ marginTop: '1rem', backgroundColor: '#fff', color: '#000', border: '4px solid #000' }}>
        <h2 className="text-center" style={{ fontSize: '1.2rem', margin: '0 0 10px 0', borderBottom: '2px dashed #000', paddingBottom: '10px' }}>Pasaporte Global</h2>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ fontSize: '3rem', transform: 'scaleX(-1)' }}>
            {player.character?.gender === 'boy' ? '👦' : '👧'}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0' }}>{player.nickname}</h1>
            <h3 style={{ margin: '5px 0', fontWeight: 'normal', fontStyle: 'italic', color: '#555' }}>
              {player.inventory?.equippedTitle || player.playerRank || 'Aprendiz del Lenguaje'}
            </h3>
            {player.completedGame && (
              <div style={{ color: '#d32f2f', fontWeight: 'bold' }}>👑 Gran Maestro del Lenguaje</div>
            )}
            <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem' }}>XP Acumulada: {player.totalXPEarned || player.xp} XP</p>
          </div>
        </div>
        <div style={{ marginTop: '10px', backgroundColor: '#eee', height: '15px', border: '1px solid #000', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${completionPercentage}%`, height: '100%', backgroundColor: '#4caf50' }}></div>
        </div>
        <div style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '5px' }}>Progreso del Juego: {completionPercentage}%</div>
      </div>

      {/* 2. PROGRESO POR REINO */}
      <div className="rpg-box" style={{ marginTop: '1rem', backgroundColor: '#fff', color: '#000', border: '4px solid #000' }}>
        <h3 className="text-center" style={{ fontSize: '1rem', marginBottom: '15px' }}>Progreso por Reinos</h3>
        
        {['espanol', 'artes', 'ingles'].map(domain => (
          <div key={domain} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold' }}>
              <span>{domain.toUpperCase()}</span>
              <span>{player.domainProgress?.[domain]?.studentsDefeated || 0} / 50 Estudiantes</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#555' }}>
              <span>XP: {player.domainProgress?.[domain]?.xp || 0}</span>
              <span>{player.badges?.[domain] ? '✅ Insignia' : '❌ Sin Insignia'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. VITRINA DE LOGROS */}
      <div className="rpg-box" style={{ marginTop: '1rem', backgroundColor: '#fff', color: '#000', border: '4px solid #000' }}>
        <h3 className="text-center" style={{ fontSize: '1rem', marginBottom: '15px' }}>Vitrina de Logros</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {ACHIEVEMENTS_LIST.map(ach => {
            const unlocked = hasAchievement(ach.id);
            return (
              <div key={ach.id} style={{ 
                width: '60px', height: '60px', 
                backgroundColor: unlocked ? '#fff9c4' : '#eee',
                border: unlocked ? '2px solid #fbc02d' : '2px dashed #ccc',
                opacity: unlocked ? 1 : 0.4,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                borderRadius: '8px'
              }} title={ach.name}>
                <span style={{ fontSize: '1.5rem' }}>{ach.icon}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 4. ESTADÍSTICAS EXTENDIDAS */}
      <div className="rpg-box" style={{ marginTop: '1rem', backgroundColor: '#fff', color: '#000', border: '4px solid #000' }}>
        <h3 className="text-center" style={{ fontSize: '1rem', marginBottom: '10px' }}>Estadísticas de Combate</h3>
        <ul style={{ fontSize: '0.8rem', margin: 0, paddingLeft: '20px' }}>
          <li>Total Combates: {player.totalBattles || 0}</li>
          <li>Victorias Totales: <span style={{ color: 'green', fontWeight: 'bold' }}>{player.victories || 0}</span></li>
          <li>Mejor Racha de Victorias: <span style={{ color: 'orange', fontWeight: 'bold' }}>{player.stats?.bestStreak || 0} 🔥</span></li>
          <li>Derrotas: <span style={{ color: 'red' }}>{player.defeats || 0}</span></li>
          {player.totalVoiceQuestions > 0 && (
            <li style={{ marginTop: '5px' }}>
              Precisión oral promedio: <strong>{Math.round(player.averagePronunciationScore)}%</strong>
            </li>
          )}
        </ul>
      </div>

      <div style={{ marginTop: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
        <button className="btn-retro" style={{ padding: '10px 30px' }} onClick={() => navigate('/map')}>
          Volver al Mapa
        </button>
        <button className="btn-retro" style={{ padding: '10px 30px', backgroundColor: '#e53935' }} onClick={() => {
          logout();
          navigate('/');
        }}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}

export default Profile
