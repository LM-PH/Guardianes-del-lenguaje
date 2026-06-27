import React, { useState, useEffect } from 'react'

function Admin() {
  const [npcs, setNpcs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterMap, setFilterMap] = useState('')
  const [selectedNpc, setSelectedNpc] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loadingQs, setLoadingQs] = useState(false)

  const fetchNpcs = () => {
    setLoading(true)
    const url = filterMap ? `/api/admin/npcs?map=${filterMap}&limit=200` : '/api/admin/npcs?limit=200'
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setNpcs(data.npcs)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchNpcs()
  }, [filterMap])

  const loadQuestions = (npcId) => {
    setLoadingQs(true)
    fetch(`/api/admin/questions/${npcId}`)
      .then(res => res.json())
      .then(data => {
        setQuestions(data)
        setSelectedNpc(npcId)
        setLoadingQs(false)
      })
      .catch(err => {
        console.error(err)
        setLoadingQs(false)
      })
  }

  const handleRegenerate = (npcId) => {
    alert(`La función de regenerar ${npcId} llamará al backend para recrear sus preguntas y actualizará la BD (Próximamente conectada al script)`);
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1>Panel de Administración: NPCs y Preguntas</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <label>Filtrar por Mapa: </label>
        <select value={filterMap} onChange={e => setFilterMap(e.target.value)} style={{ padding: '5px' }}>
          <option value="">Todos</option>
          <option value="mapa_espanol">Español</option>
          <option value="mapa_artes">Artes</option>
          <option value="mapa_ingles">Inglés</option>
          <option value="ciudad_maestros">Ciudad Maestros (Integrador)</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Tabla de NPCs */}
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>Estudiantes Registrados ({npcs.length})</h2>
          {loading ? <p>Cargando...</p> : (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#eee', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th style={{ padding: '10px' }}>Zona</th>
                    <th style={{ padding: '10px' }}>Dif.</th>
                    <th style={{ padding: '10px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {npcs.map(npc => (
                    <tr key={npc.npcId} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>{npc.npcId}</td>
                      <td style={{ padding: '10px' }}>{npc.zone}</td>
                      <td style={{ padding: '10px' }}>{npc.difficulty}</td>
                      <td style={{ padding: '10px' }}>
                        <button onClick={() => loadQuestions(npc.npcId)} style={{ padding: '5px 10px', marginRight: '5px', cursor: 'pointer', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px' }}>Ver Preguntas</button>
                        <button onClick={() => handleRegenerate(npc.npcId)} style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}>Regenerar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Panel de Preguntas */}
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>Preguntas del NPC {selectedNpc ? `(${selectedNpc})` : ''}</h2>
          {!selectedNpc ? (
            <p>Selecciona un NPC para ver sus preguntas únicas.</p>
          ) : loadingQs ? (
            <p>Cargando preguntas...</p>
          ) : (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <p><strong>Total asignadas:</strong> {questions.length}</p>
              {questions.map((q, idx) => (
                <div key={q.questionId} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  <div style={{ fontWeight: 'bold' }}>{idx + 1}. {q.questionId} ({q.type})</div>
                  <div style={{ margin: '5px 0' }}>{q.question}</div>
                  
                  {q.type === 'multiple_choice' ? (
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem' }}>
                      {q.options.map((opt, i) => (
                        <li key={i} style={{ color: i === q.correctAnswer ? 'green' : 'black', fontWeight: i === q.correctAnswer ? 'bold' : 'normal' }}>
                          {opt}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ fontSize: '0.9rem', color: '#1976d2' }}>
                      <strong>Respuesta Esperada: </strong> {q.expectedAnswer}
                    </div>
                  )}
                  
                  <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '5px', fontStyle: 'italic' }}>
                    Nota: {q.explanation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Admin
