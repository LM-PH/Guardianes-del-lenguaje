const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// Obtener preguntas aleatorias para batalla basadas en el npcId
router.get('/battle', async (req, res) => {
  try {
    const { npcId, count } = req.query;
    
    // Obtener preguntas filtradas por npcId
    let questions = await Question.find({ npcId: npcId });

    // Mezclar aleatoriamente
    questions.sort(() => 0.5 - Math.random());

    // Devolver la cantidad solicitada (o menos si no hay suficientes)
    const limit = Number(count) || 5;
    res.json(questions.slice(0, limit));
    
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener preguntas', error: error.message });
  }
});

module.exports = router;
