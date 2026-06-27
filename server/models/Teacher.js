const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  teacherId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  title: { type: String, required: true },
  subject: { type: String, enum: ["espanol", "artes", "ingles", "integrador"], required: true },
  map: { type: String, required: true },
  schoolName: { type: String, required: true },
  badgeReward: { type: String, required: true },
  requiredXp: { type: Number, required: true },
  requiredDefeatedStudents: { type: Number, required: true },
  difficulty: { type: Number, default: 3 },
  questionIds: [{ type: String }],
  defeatedBy: [{ type: String }]
});

module.exports = mongoose.model('Teacher', teacherSchema, 'teachers');
