import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Ranking() {
  const navigate = useNavigate()
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/players/ranking')
      .then(res => res.json())
      .then(data => {
        setRanking(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>Cargando Ranking...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#2b2b2b', color: '#fff', minHeight: '100vh', padding: '20px' }}>
      
      <div className="rpg-box" style={{ width: '80%', maxWidth: '600px', backgroundColor: '#fff', color: '#000', border: '4px solid #000' }}>
        <h2 className="text-center" style={{ fontSize: '1.5rem', marginBottom: '20px', borderBottom: '2px dashed #000', paddingBottom: '10px' }}>
          🏆 Ranking de Maestros 🏆
        </h2>

        <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
          {ranking.map((player, index) => (
            <div key={player._id} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '10px', 
              borderBottom: '1px solid #ccc',
              backgroundColor: player.completedGame ? '#fff9c4' : 'transparent'
            }}>
              <div style={{ width: '40px', fontWeight: 'bold', fontSize: '1.2rem', color: index < 3 ? '#d32f2f' : '#333' }}>
                #{index + 1}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {player.nickname} {player.completedGame && '👑'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#555' }}>
                  Nivel {player.playerLevel} - {player.inventory?.equippedTitle || player.playerRank}
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold' }}>{player.totalXPEarned} XP</div>
                {player.averagePronunciationScore > 0 && (
                  <div style={{ fontSize: '0.7rem', color: '#555' }}>🎤 {Math.round(player.averagePronunciationScore)}%</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="btn-retro" style={{ marginTop: '20px', padding: '10px 30px' }} onClick={() => navigate('/map')}>
        Volver al Mapa
      </button>
      
    </div>
  )
}

export default Ranking
