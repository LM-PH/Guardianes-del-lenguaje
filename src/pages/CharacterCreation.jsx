import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { jwtDecode } from "jwt-decode"

const PETS = [
  'Perrito', 'Gatito', 'Zorrito', 'Conejito', 'Búho', 'Tortuguita', 'Periquito'
];

function CharacterCreation() {
  const navigate = useNavigate()
  const { login, creationTempData } = useContext(AuthContext)
  
  const [nickname, setNickname] = useState('')
  const [gender, setGender] = useState(null)
  const [mascot, setMascot] = useState(null)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleStart = async () => {
    if (!nickname.trim()) {
      return alert('¡Debes escribir un nickname!')
    }
    if (!gender) {
      return alert('¡Elige si eres niño o niña!')
    }
    if (!mascot) {
      return alert('¡Elige una mascota acompañante!')
    }
    if (!creationTempData || !creationTempData.token) {
      alert("Falta el token de sesión. Vuelve al inicio.");
      navigate('/');
      return;
    }

    setLoading(true)
    setError(null)

    try {
      const decoded = jwtDecode(creationTempData.token);

      const payload = {
        googleId: decoded.googleId,
        email: decoded.email,
        nickname: nickname.trim(),
        character: {
          gender: gender,
          sprite: `sprite_${gender}.png`
        },
        pet: {
          id: mascot.toLowerCase(),
          type: mascot.toLowerCase(),
          name: mascot,
          sprite: `sprite_${mascot.toLowerCase()}.png`
        }
      };

      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Error al guardar el jugador')
      }

      // Éxito, guardar sesión y redirigir al mapa
      login(data.token, data.player.userId);
      navigate('/map')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <h2 className="text-center" style={{ fontSize: '1rem', marginTop: '1rem' }}>Crear Personaje</h2>
      
      {error && <p style={{ color: 'var(--gbc-primary)', fontSize: '0.6rem', textAlign: 'center', margin: '10px 0' }}>{error}</p>}

      <div className="rpg-box" style={{ marginBottom: '10px' }}>
        <p>Tu Nickname:</p>
        <input 
          type="text" 
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Escribe aquí..."
          style={{ 
            width: '100%', 
            padding: '10px', 
            fontFamily: '"Press Start 2P", cursive',
            fontSize: '0.6rem',
            border: '2px solid var(--gbc-black)',
            marginTop: '5px'
          }} 
          maxLength={12}
        />
      </div>

      <div className="rpg-box" style={{ marginBottom: '10px' }}>
        <p>Elige tu personaje:</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-retro" 
            style={{ backgroundColor: gender === 'boy' ? 'var(--gbc-primary)' : 'var(--gbc-gray)' }}
            onClick={() => setGender('boy')}
          >
            Niño
          </button>
          <button 
            className="btn-retro" 
            style={{ backgroundColor: gender === 'girl' ? 'var(--gbc-primary)' : 'var(--gbc-gray)' }}
            onClick={() => setGender('girl')}
          >
            Niña
          </button>
        </div>
      </div>

      <div className="rpg-box" style={{ marginBottom: '10px' }}>
        <p>Elige mascota (sólo visual):</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {PETS.map(m => (
            <button 
              key={m}
              className="btn-retro" 
              style={{ 
                backgroundColor: mascot === m ? 'var(--gbc-secondary)' : 'var(--gbc-gray)', 
                padding: '10px',
                width: 'calc(50% - 5px)',
                margin: 0
              }}
              onClick={() => setMascot(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {gender && mascot && (
        <div className="rpg-box text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p>Vista Previa</p>
          <div style={{ display: 'flex', gap: '20px', marginTop: '10px', alignItems: 'flex-end' }}>
             <div style={{ width: '40px', height: '60px', backgroundColor: 'var(--gbc-primary)', border: '2px solid var(--gbc-black)' }} title={`Personaje: ${gender}`}></div>
             <div style={{ width: '30px', height: '30px', backgroundColor: 'var(--gbc-secondary)', border: '2px solid var(--gbc-black)' }} title={`Mascota: ${mascot}`}></div>
          </div>
          <p style={{ fontSize: '0.5rem', marginTop: '10px', color: 'var(--gbc-gray)' }}>
            *La mascota no otorga ventajas.
          </p>
        </div>
      )}

      <div style={{ marginTop: 'auto', marginBottom: '1rem' }}>
        <button className="btn-retro success" onClick={handleStart} disabled={loading}>
          {loading ? 'Guardando...' : 'Comenzar Aventura'}
        </button>
      </div>
    </div>
  )
}

export default CharacterCreation
