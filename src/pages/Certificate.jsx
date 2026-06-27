import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

function Certificate() {
  const navigate = useNavigate()
  const [player, setPlayer] = useState(null)
  const certRef = useRef(null)

  useEffect(() => {
    fetch('/api/players/demo-user')
      .then(res => res.json())
      .then(data => {
        if (!data.finalBossDefeated) {
          navigate('/map')
        } else {
          setPlayer(data)
        }
      })
      .catch(err => navigate('/map'))
  }, [navigate])

  const downloadPDF = async () => {
    if (!certRef.current) return;
    const canvas = await html2canvas(certRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    // A4 Landscape
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
    pdf.save(`Certificado_GranMaestro_${player.nickname}.pdf`);
  }

  if (!player) return <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>Generando Certificado...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#2b2b2b', minHeight: '100vh', padding: '20px' }}>
      
      <div 
        ref={certRef}
        style={{
          width: '800px',
          height: '565px', // Aspect ratio aprox A4
          backgroundColor: '#fff',
          backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
          border: '10px double #b8860b',
          padding: '40px',
          color: '#333',
          fontFamily: '"Times New Roman", Times, serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)',
          position: 'relative'
        }}
      >
        <div style={{ position: 'absolute', top: '20px', left: '20px', fontSize: '3rem' }}>📖</div>
        <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '3rem' }}>🎨</div>
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', fontSize: '3rem' }}>🌐</div>
        <div style={{ position: 'absolute', bottom: '20px', right: '20px', fontSize: '3rem' }}>👑</div>
        
        <h1 style={{ fontSize: '3rem', color: '#b8860b', margin: 0, textTransform: 'uppercase', letterSpacing: '3px' }}>
          La Gran Academia del Lenguaje
        </h1>
        <h2 style={{ fontSize: '1.5rem', margin: 0, fontStyle: 'italic', fontWeight: 'normal' }}>
          Otorga el presente certificado a:
        </h2>
        
        <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#000', borderBottom: '2px solid #b8860b', padding: '0 40px' }}>
          {player.nickname}
        </div>
        
        <p style={{ fontSize: '1.2rem', textAlign: 'center', maxWidth: '80%' }}>
          Por haber completado con honor y excelencia los cuatro caminos del conocimiento, derrotando a los estudiantes, superando a los maestros de las tres regiones, y venciendo al mismísimo Gran Maestro.
        </p>
        
        <h3 style={{ fontSize: '2rem', color: '#d32f2f', margin: 0 }}>
          Título Otorgado: Gran Maestro del Lenguaje
        </h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', marginTop: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, borderBottom: '1px solid #000', width: '200px', paddingBottom: '5px' }}>
              {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <span style={{ fontSize: '0.9rem' }}>Fecha de Emisión</span>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, borderBottom: '1px solid #000', width: '200px', paddingBottom: '5px', fontStyle: 'italic', fontSize: '1.2rem' }}>
              El Gran Maestro
            </p>
            <span style={{ fontSize: '0.9rem' }}>Firma Digital</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', display: 'flex', gap: '20px' }}>
        <button className="btn-retro success" style={{ padding: '15px 30px', fontSize: '1.2rem' }} onClick={downloadPDF}>
          📥 Descargar en PDF
        </button>
        <button className="btn-retro" style={{ padding: '15px 30px', fontSize: '1.2rem' }} onClick={() => navigate('/ranking')}>
          🏆 Ver Ranking Global
        </button>
      </div>

    </div>
  )
}

export default Certificate
