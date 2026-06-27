const mongoose = require('mongoose');

const npcSchema = new mongoose.Schema({
  npcId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  map: { type: String, required: true }, // 'espanol', 'artes', 'ingles'
  zone: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  subject: { type: String, enum: ["espanol", "artes", "ingles", "integrador"], required: true },
  difficulty: { type: Number, required: true }, // 1 (Fácil), 2 (Media), 3 (Difícil)
  xpReward: { type: Number, required: true },
  defeatedBy: [{ type: String }], // Array de userIds que lo han derrotado
  questionIds: [{ type: String }] // Array de questionIds asignadas a este NPC
});

module.exports = mongoose.model('Npc', npcSchema, 'npcs');
