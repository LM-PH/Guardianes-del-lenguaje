import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { triggerSaveEvent } from '../components/SaveIndicator'
import { AuthContext } from '../context/AuthContext'

// Utilidad: Distancia de Levenshtein para similitud de strings (ignorando mayúsculas y puntuación)
const calculateSimilarity = (str1, str2) => {
  const s1 = (str1 || "").toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, ' ');
  const s2 = (str2 || "").toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, ' ');
  
  if (s1 === s2) return 100;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  let costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  const distance = costs[s2.length];
  const maxLen = Math.max(s1.length, s2.length);
  return Math.round(((maxLen - distance) / maxLen) * 100);
}
function Battle() {
  const navigate = useNavigate()
  const location = useLocation()
  const { userId, authenticatedFetch } = useContext(AuthContext)
  const queryParams = new URLSearchParams(location.search)
  
  const npcId = queryParams.get('npcId')
  const subject = queryParams.get('subject') || 'espanol'
  const difficulty = Number(queryParams.get('difficulty')) || 1
  const isBoss = queryParams.get('isBoss') === 'true'
  const isFinalBoss = queryParams.get('isFinalBoss') === 'true'
  const npcName = queryParams.get('name') || (isBoss ? (isFinalBoss ? 'Gran Maestro del Lenguaje' : 'El Maestro') : 'Estudiante')

  const [player, setPlayer] = useState(null)
  const [questions, setQuestions] = useState([])
  
  // Estados de Combate
  const [phase, setPhase] = useState('intro') // intro, question, feedback, end, cinematic
  const [currentQIndex, setCurrentQIndex] = useState(0)
  
  // Configuración por dificultad
  const config = {
    1: { qCount: 5, dmgEnemy: 20, dmgPlayer: 10, xp: 10 },
    2: { qCount: 7, dmgEnemy: 25, dmgPlayer: 15, xp: 20 },
    3: { qCount: 10, dmgEnemy: 30, dmgPlayer: 20, xp: 40 },
    boss: { qCount: 12, dmgEnemy: 25, dmgPlayer: 25, xp: 150 },
    finalBoss: { qCount: 15, dmgEnemy: 250 / 8, dmgPlayer: 25, xp: 500 } // 250 HP, ~8 aciertos para ganar
  }
  
  const currentConfig = isFinalBoss ? config.finalBoss : (isBoss ? config.boss : (config[difficulty] || config[1]))
  
  // HP
  const [playerHp, setPlayerHp] = useState(100)
  const maxEnemyHp = isFinalBoss ? 250 : (isBoss ? 150 : 100)
  const [enemyHp, setEnemyHp] = useState(maxEnemyHp)
  
  // Feedback
  const [feedback, setFeedback] = useState({ isCorrect: false, text: '', damageType: '' }) 
  
  // Stats
  const [corrects, setCorrects] = useState(0)
  const [incorrects, setIncorrects] = useState(0)
  
  // Stats de Voz
  const [voiceStats, setVoiceStats] = useState({ total: 0, correct: 0, incorrect: 0, scoreSum: 0 })
  const [isRecording, setIsRecording] = useState(false)
  const [recognizedText, setRecognizedText] = useState('')

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }
    const loadPlayer = async () => {
      try {
        const res = await authenticatedFetch(`/api/players/${userId}`)
        if (res.ok) {
          const data = await res.json()
          setPlayer(data)
        } else {
          navigate('/create')
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadPlayer()

    authenticatedFetch(`/api/questions/battle?npcId=${npcId}&count=${currentConfig.qCount}`)
      .then(res => res.json())
      .then(data => {
        setQuestions(data)
        setTimeout(() => setPhase('question'), 2000)
      })
      .catch(err => console.error(err))
  }, [userId, authenticatedFetch, npcId, currentConfig.qCount, navigate])

  const getEnemySprite = (name, subject) => {
    if (isFinalBoss) return '/sprites/gran_maestro.png?v=19';
    // Siempre usar alumnos para los duelos regulares
    const hash = (name || '').split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
    const isGirl = Math.abs(hash) % 2 !== 0;
    const useRedcap = Math.abs(hash) % 3 === 0;
    if (isGirl) return useRedcap ? '/sprites/student_redcap_girl_final.png?v=19' : '/sprites/girl_final.png?v=19';
    return useRedcap ? '/sprites/student_redcap_boy_final.png?v=19' : '/sprites/boy_final.png?v=19';
  };

  const getSkinEmoji = (eqSkin) => {
    if (eqSkin === 'skin_explorador') return '🤠';
    if (eqSkin === 'skin_bibliotecario') return '🤓';
    if (eqSkin === 'skin_artista') return '🧑‍🎨';
    if (eqSkin === 'skin_traductor') return '🗣️';
    if (eqSkin === 'skin_maestro') return '🧑‍🏫';
    if (eqSkin === 'skin_sabio') return '🧙';
    return '';
  };

  const checkEndBattle = (newEnemyHp, newPlayerHp) => {
    if (newEnemyHp <= 0 || newPlayerHp <= 0) {
      setTimeout(() => {
        setPhase('end');
        finishBattle(newEnemyHp <= 0);
      }, 3000);
    } else if (currentQIndex + 1 >= questions.length) {
      setTimeout(() => {
        setPhase('end');
        finishBattle(false);
      }, 3000);
    }
  }

  // Manejar respuesta múltiple normal
  const handleAnswer = (selectedIndex) => {
    if (phase !== 'question') return;
    
    const q = questions[currentQIndex];
    const isCorrect = selectedIndex === q.correctAnswer;
    
    let newEnemyHp = enemyHp;
    let newPlayerHp = playerHp;

    if (isCorrect) {
      newEnemyHp = Math.max(0, enemyHp - currentConfig.dmgEnemy);
      setEnemyHp(newEnemyHp);
      setCorrects(prev => prev + 1);
      setFeedback({ isCorrect: true, text: q.explanation, damageType: 'full' });
    } else {
      newPlayerHp = Math.max(0, playerHp - currentConfig.dmgPlayer);
      setPlayerHp(newPlayerHp);
      setIncorrects(prev => prev + 1);
      setFeedback({ isCorrect: false, text: q.explanation, damageType: 'self' });
    }

    setPhase('feedback');
    checkEndBattle(newEnemyHp, newPlayerHp);
  }

  // Manejar reconocimiento de voz
  const handleVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome.');
      // Auto fall if no support just to not block
      handleVoiceResult('', 0);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setRecognizedText('Escuchando...');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRecognizedText(transcript);
      
      const q = questions[currentQIndex];
      const similarity = calculateSimilarity(transcript, q.expectedAnswer);
      
      handleVoiceResult(transcript, similarity, q.explanation);
    };

    recognition.onerror = (event) => {
      setIsRecording(false);
      setRecognizedText('Error al escuchar. Intenta de nuevo.');
      console.error(event.error);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  }

  const handleVoiceResult = (transcript, similarity, explanation) => {
    let newEnemyHp = enemyHp;
    let newPlayerHp = playerHp;
    let type = '';

    setVoiceStats(prev => ({
      ...prev,
      total: prev.total + 1,
      scoreSum: prev.scoreSum + similarity
    }));

    if (similarity >= 90) {
      newEnemyHp = Math.max(0, enemyHp - currentConfig.dmgEnemy);
      setEnemyHp(newEnemyHp);
      setCorrects(prev => prev + 1);
      setVoiceStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      type = 'full';
      setFeedback({ isCorrect: true, text: `¡Excelente pronunciación! (${similarity}%)\n${explanation}`, damageType: type });
    } else if (similarity >= 70) {
      const partialDamage = Math.round(currentConfig.dmgEnemy * 0.8);
      newEnemyHp = Math.max(0, enemyHp - partialDamage);
      setEnemyHp(newEnemyHp);
      setCorrects(prev => prev + 1);
      setVoiceStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      type = 'partial';
      setFeedback({ isCorrect: true, text: `Buena pronunciación (${similarity}%). Escuchamos: "${transcript}".\n${explanation}`, damageType: type });
    } else {
      newPlayerHp = Math.max(0, playerHp - currentConfig.dmgPlayer);
      setPlayerHp(newPlayerHp);
      setIncorrects(prev => prev + 1);
      setVoiceStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      type = 'self';
      setFeedback({ isCorrect: false, text: `Pronunciación incorrecta (${similarity}%). Escuchamos: "${transcript}".\nEsperábamos: "${questions[currentQIndex].expectedAnswer}"\n${explanation}`, damageType: type });
    }

    setPhase('feedback');
    checkEndBattle(newEnemyHp, newPlayerHp);
  }

  const nextQuestion = () => {
    setCurrentQIndex(prev => prev + 1);
    setRecognizedText('');
    setPhase('question');
  }

  const finishBattle = async (win) => {
    try {
      triggerSaveEvent('saving')
      const response = await authenticatedFetch(`/api/players/${userId}/battle-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          win,
          xpGained: win ? currentConfig.xp : 0,
          corrects,
          incorrects,
          npcId: win ? npcId : null,
          voiceStats,
          isBoss,
          subject
        })
      });
      const data = await response.json();
      if(data.newAchievements && data.newAchievements.length > 0) {
        // Podríamos mostrar un toast de logro aquí
        console.log("Nuevos logros!", data.newAchievements);
      }
      triggerSaveEvent('saved')
    } catch (err) {
      console.error(err);
    }
  }

  if (!player || questions.length === 0) return <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>Preparando combate...</div>

  const isWin = enemyHp <= 0;
  const currentQ = questions[currentQIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#2b2b2b', color: '#fff' }}>
      
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(244, 67, 54, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); opacity: 0.5; }
          50% { transform: translateX(5px); opacity: 1; }
          75% { transform: translateX(-5px); opacity: 0.5; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .retro-hp-bar {
          transition: width 0.3s ease-out, background-color 0.3s;
        }
        /* Animar 4 frames en fila 0 (down) para el enemigo */
        .sprite-walk-front {
          animation: walk 0.8s steps(4) infinite;
          background-position-y: 0%;  /* Fila 0 = down */
        }
        /* Animar 4 frames en fila 1 (up) para el jugador (espalda) */
        .sprite-walk-back {
          animation: walk 0.8s steps(4) infinite;
          background-position-y: 33.33%;  /* Fila 1 = up */
        }
      `}</style>
      
      {/* HEADER: ZONA DE SPRITES Y HP (ESTILO POKÉMON GAME BOY) */}
      <div className="gba-battle-bg" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* HUD y Sprite Enemigo (Arriba) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 10px 0 10px', alignItems: 'flex-start' }}>
          {/* HUD Enemigo */}
          <div className="gba-hud">
            <div className="gba-hud-title">
              <span>{npcName}</span>
              <span>Lv{difficulty}</span>
            </div>
            <div className="gba-hp-container">
              <span className="gba-hp-label">HP</span>
              <div className="gba-hp-bar-bg">
                <div className="retro-hp-bar" style={{ width: `${(enemyHp / maxEnemyHp) * 100}%`, height: '100%', backgroundColor: enemyHp > maxEnemyHp * 0.5 ? '#60b044' : enemyHp > maxEnemyHp * 0.2 ? '#f1c40f' : '#e74c3c' }}></div>
              </div>
            </div>
          </div>

          {/* Sprite Enemigo */}
          <div style={{ position: 'relative', width: '120px', height: '140px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', animation: phase === 'feedback' && feedback.isCorrect ? 'shake 0.5s' : 'none', marginRight: '20px' }}>
            <div className="gba-grass-base" style={{ width: '120px', height: '120px', bottom: '-40px' }}></div>
            {/* Sprite GBA: fila 0 = facing down (hacia el jugador), 4 cols x 4 rows */}
            <div className="sprite-walk-front" style={{ 
              position: 'relative', zIndex: 1, width: '80px', height: '80px', 
              backgroundImage: `url('${getEnemySprite(npcName, subject)}')`, 
              backgroundSize: '400% 400%',
              backgroundPositionY: '0%',  /* Fila 0 = down = mirando hacia jugador */
              imageRendering: 'pixelated' 
            }}></div>
          </div>
        </div>

        {/* HUD y Sprite Jugador (Abajo) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px 20px 10px', alignItems: 'flex-end', marginTop: 'auto' }}>
          {/* Sprite Jugador */}
          <div style={{ position: 'relative', width: '120px', height: '140px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', animation: phase === 'feedback' && !feedback.isCorrect ? 'shake 0.5s' : 'none' }}>
            <div className="gba-grass-base" style={{ width: '160px', height: '160px', bottom: '-60px' }}></div>
            {/* Sprite GBA: fila 1 = up (espalda al jugador, mirando al enemigo) */}
            <div className="sprite-walk-back" style={{ 
              position: 'relative', zIndex: 1, width: '90px', height: '90px', 
              backgroundImage: `url('/sprites/${player.character.gender === 'girl' ? 'girl_final.png?v=19' : 'boy_final.png?v=19'}')`, 
              backgroundSize: '400% 400%',
              backgroundPositionY: '33.33%',  /* Fila 1 = up = espalda */
              imageRendering: 'pixelated' 
            }}>
               {player.inventory?.equippedSkin && (
                 <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '1.2rem', backgroundColor: '#fff', borderRadius: '50%', border: '2px solid #111', width: '28px', height: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                   {getSkinEmoji(player.inventory.equippedSkin)}
                 </div>
               )}
            </div>
          </div>

          {/* HUD Jugador */}
          <div className="gba-hud">
            <div className="gba-hud-title">
              <span>{player.nickname}</span>
              <span>Lv{player.playerLevel || 1}</span>
            </div>
            <div className="gba-hp-container" style={{ marginBottom: '4px' }}>
              <span className="gba-hp-label">HP</span>
              <div className="gba-hp-bar-bg">
                <div className="retro-hp-bar" style={{ width: `${playerHp}%`, height: '100%', backgroundColor: playerHp > 50 ? '#60b044' : playerHp > 20 ? '#f1c40f' : '#e74c3c' }}></div>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.8rem', fontWeight: 'bold', color: '#424242', fontFamily: 'Arial, Helvetica, sans-serif' }}>
              {playerHp}/100
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER: ZONA DE INTERACCIÓN */}
      <div style={{ height: '40%', backgroundColor: '#f0f0f0', borderTop: '4px solid #545454', display: 'flex', flexDirection: 'column' }}>
        
        {phase === 'intro' && (
          <div className="rpg-box" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '15px' }}>
            <p style={{ margin: 0 }}>¡{npcName} te ha desafiado a un duelo de conocimientos!</p>
          </div>
        )}

        {phase === 'question' && currentQ.type === 'multiple_choice' && (
          <div style={{ flex: 1, display: 'flex', padding: '10px', gap: '10px' }}>
            <div className="rpg-box" style={{ flex: 2, margin: 0, overflowY: 'auto' }}>
              <p style={{ margin: 0 }}>{currentQ.question}</p>
            </div>
            <div className="rpg-box" style={{ flex: 1, margin: 0, display: 'flex', flexDirection: 'column', padding: '5px' }}>
              {currentQ.options.map((opt, i) => (
                <button key={i} className="btn-retro" onClick={() => handleAnswer(i)}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'question' && currentQ.type === 'voice' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="rpg-box" style={{ marginBottom: '10px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: '0.8rem', textAlign: 'center', marginBottom: '10px' }}>{currentQ.question}</p>
              
              <button 
                className="btn-retro" 
                style={{ 
                  backgroundColor: isRecording ? '#f44336' : '#2196f3',
                  color: 'white', fontSize: '2rem', borderRadius: '50%', width: '60px', height: '60px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: isRecording ? 'pulse 1s infinite' : 'none'
                }}
                onClick={handleVoiceRecording}
                disabled={isRecording}
              >
                🎤
              </button>
              
              <div style={{ marginTop: '10px', fontSize: '0.7rem', color: '#555', fontStyle: 'italic' }}>
                {recognizedText || 'Presiona el micrófono y habla'}
              </div>
            </div>
            
            <style>{`
            `}</style>
          </div>
        )}

        {phase === 'feedback' && (
          <div className="rpg-box" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ color: feedback.isCorrect ? '#4caf50' : '#f44336' }}>
              {feedback.isCorrect ? '¡CORRECTO!' : '¡INCORRECTO!'}
              {feedback.damageType === 'partial' && <span style={{fontSize: '0.6rem', color: '#ff9800', marginLeft: '5px'}}>(Daño Parcial)</span>}
            </h3>
            <p style={{ fontSize: '0.7rem', marginTop: '10px', textAlign: 'center', whiteSpace: 'pre-line' }}>{feedback.text}</p>
            
            {(enemyHp > 0 && playerHp > 0 && currentQIndex + 1 < questions.length) && (
              <button className="btn-retro" style={{ marginTop: '10px', padding: '5px 20px' }} onClick={nextQuestion}>Continuar</button>
            )}
          </div>
        )}

        {phase === 'end' && (
          <div className="rpg-box" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ color: isWin ? '#4caf50' : '#f44336' }}>
              {isWin ? '¡VICTORIA!' : 'HAS SIDO DERROTADO'}
            </h2>
            <p style={{ fontSize: '0.8rem', marginTop: '10px' }}>
              {isWin ? `Ganaste ${currentConfig.xp} XP` : `Perdiste ${isBoss ? 20 : 5} XP`}
            </p>
            {isWin && isFinalBoss && (
              <div style={{ margin: '10px 0', textAlign: 'center', color: '#ffeb3b', animation: 'pulse 1s infinite' }}>
                <h3>¡HAS DERROTADO AL GRAN MAESTRO! 👑</h3>
                <p style={{ fontSize: '0.8rem', color: '#fff' }}>Ahora eres Leyenda del Lenguaje.</p>
              </div>
            )}
            {isWin && isBoss && !isFinalBoss && (
              <div style={{ margin: '10px 0', textAlign: 'center', color: '#ffeb3b', animation: 'pulse 1s infinite' }}>
                <h3>¡Has ganado la Insignia! 🎖️</h3>
                <div style={{ fontSize: '2rem' }}>👦🐶✨</div>
              </div>
            )}
            {voiceStats.total > 0 && (
              <p style={{ fontSize: '0.6rem', marginTop: '5px', color: '#555' }}>
                Retos orales: {voiceStats.correct} bien, {voiceStats.incorrect} mal. Promedio: {Math.round(voiceStats.scoreSum / voiceStats.total)}%
              </p>
            )}
            <button className="btn-retro success" style={{ marginTop: '20px', padding: '10px 30px' }} onClick={() => {
              if (isWin && isFinalBoss) {
                setPhase('cinematic');
              } else {
                navigate('/map');
              }
            }}>
              Continuar
            </button>
          </div>
        )}

        {phase === 'cinematic' && (
          <div className="rpg-box" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffd54f', color: '#000' }}>
            <h2>Gran Maestro del Lenguaje</h2>
            <p style={{ textAlign: 'center', fontSize: '0.9rem', margin: '10px 0' }}>
              "Has recorrido los cuatro caminos del lenguaje. <br/>
              Has demostrado ser digno de convertirte en Gran Maestro."
            </p>
            <div style={{ display: 'flex', gap: '15px', fontSize: '2.5rem', marginBottom: '15px' }}>
              <span title="Maestro de Español">📖</span>
              <span title="Maestra de Artes">🎨</span>
              <span title="Maestro de Inglés">🌐</span>
              <span title="Gran Maestro">👑</span>
              <span title="Tú">👦</span>
            </div>
            <p style={{ fontWeight: 'bold' }}>Has alcanzado el máximo dominio del Reino de los Lenguajes.</p>
            <button className="btn-retro" style={{ marginTop: '10px' }} onClick={() => navigate('/certificate')}>
              Obtener Certificado Digital
            </button>
          </div>
        )}
      </div>

    </div>
  )
}

export default Battle
