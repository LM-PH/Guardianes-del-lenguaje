const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// Obtener preguntas aleatorias para batalla
// En lugar de usar npcId fijo, mezclamos del pool del subject+zone
// para que cada batalla sea diferente
router.get('/battle', async (req, res) => {
  try {
    const { npcId, count } = req.query;
    
    // 1. Buscar el NPC para saber su subject y zone
    const Npc = require('../models/Npc');
    const npc = await Npc.findOne({ npcId });
    
    let questions;
    
    if (npc) {
      // 2. Obtener TODAS las preguntas de ese subject+zone (pool completo)
      questions = await Question.find({
        subject: npc.subject,
        zone: npc.zone
      });
      
      // Si hay muy pocas, ampliar al subject completo
      if (questions.length < 5) {
        questions = await Question.find({ subject: npc.subject });
      }
    } else {
      // Fallback: preguntas del npcId original
      questions = await Question.find({ npcId: npcId });
    }

    // 3. Mezclar aleatoriamente usando Fisher-Yates para mejor aleatoriedad
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    // 4. Tomar la cantidad solicitada
    const limit = Number(count) || 5;
    const selectedQuestions = questions.slice(0, limit);

    // 5. Mezclar opciones de cada pregunta (para que la respuesta no siempre esté en el mismo lugar)
    const processedQuestions = selectedQuestions.map(q => {
      const qObj = q.toObject();
      if (qObj.type === 'multiple_choice' && qObj.options && qObj.options.length > 1) {
        // Fisher-Yates en las opciones
        const optionsWithFlag = qObj.options.map((opt, index) => ({
          text: opt,
          isCorrect: index === qObj.correctAnswer
        }));
        
        for (let i = optionsWithFlag.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [optionsWithFlag[i], optionsWithFlag[j]] = [optionsWithFlag[j], optionsWithFlag[i]];
        }
        
        qObj.options = optionsWithFlag.map(o => o.text);
        qObj.correctAnswer = optionsWithFlag.findIndex(o => o.isCorrect);
      }
      return qObj;
    });

    res.json(processedQuestions);
    
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener preguntas', error: error.message });
  }
});

module.exports = router;
