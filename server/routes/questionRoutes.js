const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// Obtener preguntas aleatorias para batalla basadas en el npcId
router.get('/battle', async (req, res) => {
  try {
    const { npcId, count } = req.query;
    
    // Obtener preguntas filtradas por npcId
    let questions = await Question.find({ npcId: npcId });

    // Mezclar aleatoriamente el orden de las preguntas
    questions.sort(() => 0.5 - Math.random());

    // Devolver la cantidad solicitada (o menos si no hay suficientes)
    const limit = Number(count) || 5;
    let selectedQuestions = questions.slice(0, limit);

    // Shuffle options and update correctAnswer index
    const processedQuestions = selectedQuestions.map(q => {
      const qObj = q.toObject();
      if (qObj.type === 'multiple_choice' && qObj.options && qObj.options.length > 0) {
        // Create an array of objects to keep track of the original correct answer
        const optionsWithIndex = qObj.options.map((opt, index) => ({
          text: opt,
          isCorrect: index === qObj.correctAnswer
        }));
        
        // Shuffle the options
        optionsWithIndex.sort(() => 0.5 - Math.random());
        
        // Map back to string array and find the new correct index
        qObj.options = optionsWithIndex.map(o => o.text);
        qObj.correctAnswer = optionsWithIndex.findIndex(o => o.isCorrect);
      }
      return qObj;
    });

    res.json(processedQuestions);
    
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener preguntas', error: error.message });
  }
});

module.exports = router;
