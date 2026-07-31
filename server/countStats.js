const mongoose = require('mongoose');
const connectDB = require('./config/db');

const npcSchema = new mongoose.Schema({
  subject: String
});

const questionSchema = new mongoose.Schema({
  subject: String
});

const Npc = mongoose.model('Npc', npcSchema, 'npcs');
const Question = mongoose.model('Question', questionSchema, 'questions');

async function countStats() {
  try {
    await connectDB();
    console.log("Conectado a la BD para contar estadísticas...");

    const npcCounts = await Npc.aggregate([
      { $group: { _id: "$subject", count: { $sum: 1 } } }
    ]);

    const questionCounts = await Question.aggregate([
      { $group: { _id: "$subject", count: { $sum: 1 } } }
    ]);

    const npcQuestionCounts = await Npc.aggregate([
      { $project: { numQuestions: { $size: "$questionIds" } } },
      { $group: { _id: "$numQuestions", count: { $sum: 1 } } }
    ]);

    console.log("--- Estudiantes (NPCs) por Disciplina ---");
    npcCounts.forEach(doc => console.log(`${doc._id}: ${doc.count}`));

    console.log("\n--- Preguntas por Disciplina ---");
    questionCounts.forEach(doc => console.log(`${doc._id}: ${doc.count}`));

    console.log("\n--- Cantidad de preguntas asignadas por NPC ---");
    npcQuestionCounts.forEach(doc => console.log(`${doc.count} NPCs tienen exactamente ${doc._id} preguntas`));

    mongoose.connection.close();
  } catch (err) {
    console.error("Error:", err);
  }
}

countStats();
