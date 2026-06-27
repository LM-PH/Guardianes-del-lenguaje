import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { AuthContext } from '../context/AuthContext'

function Welcome() {
  const navigate = useNavigate()
  const { login, setCreationTempData } = useContext(AuthContext)
  const [errorMsg, setErrorMsg] = useState('')

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      const data = await res.json();
      
      if (res.ok) {
        if (data.isNew) {
          // Guardar datos temporales para que CharacterCreation los use
          setCreationTempData({ token: data.token, email: data.email });
          navigate('/create');
        } else {
          // Login exitoso
          login(data.token, data.player.userId);
          navigate('/map');
        }
      } else {
        setErrorMsg(data.message || 'Error de autenticación');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error de red');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--gbc-black)', color: 'var(--gbc-white)', textAlign: 'center' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--gbc-primary)', textShadow: '2px 2px var(--gbc-white)' }}>
          Guardianes
        </h1>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--gbc-secondary)' }}>
          del Lenguaje
        </h2>
      </div>

      <div className="rpg-box" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: '#ffeb3b' }}>Inicia sesión para jugar</p>
        
        {errorMsg && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorMsg}</p>}

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            console.log('Login Failed');
            setErrorMsg('Error con Google Sign In');
          }}
          useOneTap
        />
      </div>

    </div>
  )
}

export default Welcome
