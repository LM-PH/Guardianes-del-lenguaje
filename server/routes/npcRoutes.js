const express = require('express');
const router = express.Router();
const Npc = require('../models/Npc');

// Obtener todos los NPCs de un mapa específico
router.get('/:map', async (req, res) => {
  try {
    const npcs = await Npc.find({ map: req.params.map });
    res.json(npcs);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los NPCs', error: error.message });
  }
});

module.exports = router;
