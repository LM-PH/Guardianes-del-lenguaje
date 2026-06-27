import React, { useState, useEffect } from 'react';

// Exportamos una función global para emitir el evento de guardado
export const triggerSaveEvent = (status) => {
  const event = new CustomEvent('game-save', { detail: { status } });
  window.dispatchEvent(event);
};

function SaveIndicator() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleSave = (e) => {
      const { status } = e.detail;
      setShow(true);
      if (status === 'saving') {
        setMessage('Guardando...');
      } else if (status === 'saved') {
        setMessage('Progreso guardado');
        // Ocultar después de 2 segundos
        setTimeout(() => {
          setShow(false);
        }, 2000);
      }
    };

    window.addEventListener('game-save', handleSave);
    return () => window.removeEventListener('game-save', handleSave);
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: '#4caf50',
      padding: '10px 20px',
      borderRadius: '20px',
      fontFamily: 'monospace',
      fontSize: '0.9rem',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      border: '2px solid #4caf50'
    }}>
      {message === 'Guardando...' ? <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span> : <span>💾</span>}
      {message}
    </div>
  );
}

export default SaveIndicator;
