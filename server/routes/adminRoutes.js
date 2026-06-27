const express = require('express');
const router = express.Router();
const Npc = require('../models/Npc');
const Question = require('../models/Question');

// Listar todos los NPCs con paginación
router.get('/npcs', async (req, res) => {
  try {
    const { map, subject, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (map) filter.map = map;
    if (subject) filter.subject = subject;

    const skip = (Number(page) - 1) * Number(limit);
    const npcs = await Npc.find(filter).skip(skip).limit(Number(limit));
    const total = await Npc.countDocuments(filter);

    res.json({ npcs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar preguntas de un NPC
router.get('/questions/:npcId', async (req, res) => {
  try {
    const questions = await Question.find({ npcId: req.params.npcId });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
