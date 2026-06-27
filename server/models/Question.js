const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionId: { type: String, required: true, unique: true },
  npcId: { type: String, required: true },
  subject: { type: String, enum: ["espanol", "artes", "ingles", "integrador"], required: true },
  map: { type: String, required: true },
  zone: { type: String, required: true },
  topic: { type: String, required: true },
  type: { type: String, enum: ["multiple_choice", "voice", "image", "audio"], default: "multiple_choice" },
  difficulty: { type: Number, required: true }, // 1, 2, 3
  question: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: mongoose.Schema.Types.Mixed }, // Puede ser string o number
  expectedAnswer: { type: String }, // Para voice
  keywords: [{ type: String }], // Para validación abierta
  explanation: { type: String, required: true },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', questionSchema, 'questions');
