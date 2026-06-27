const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('./models/Question');
const connectDB = require('./config/db');

dotenv.config();

const generateQuestions = (subject, countPerDiff) => {
  const qs = [];
  let id = 1;
  for (let diff = 1; diff <= 3; diff++) {
    for (let i = 0; i < countPerDiff; i++) {
      
      // Determinar si es de voz (solo inglés o integrador)
      const isVoice = (subject === 'ingles' || subject === 'integrador') && (Math.random() < 0.3);

      if (isVoice) {
        qs.push({
          questionId: `q_${subject}_${diff}_${id++}`,
          subject: subject,
          topic: 'Speaking',
          type: 'voice',
          difficulty: diff,
          question: `Pronuncia correctamente: "My favorite subject is English"`,
          expectedAnswer: "My favorite subject is English",
          explanation: `La pronunciación correcta te otorga puntos extra en los retos orales.`
        });
      } else {
        qs.push({
          questionId: `q_${subject}_${diff}_${id++}`,
          subject: subject,
          topic: 'General',
          type: 'multiple_choice',
          difficulty: diff,
          question: `Pregunta de prueba de ${subject} (Dificultad ${diff}) - #${id}`,
          options: ['Opción A', 'Opción B (Correcta)', 'Opción C', 'Opción D'],
          correctAnswer: 1,
          explanation: `La opción B es correcta porque esto es una pregunta de prueba generada automáticamente.`
        });
      }
    }
  }
  return qs;
}

const seedQuestions = async () => {
  try {
    await connectDB();
    console.log('Limpiando colección Questions anterior...');
    await Question.deleteMany();

    console.log('Generando Preguntas de Prueba (incluyendo Retos de Voz)...');
    let allQs = [];

    allQs = allQs.concat(generateQuestions('espanol', 12));
    allQs = allQs.concat(generateQuestions('artes', 12));
    allQs = allQs.concat(generateQuestions('ingles', 15)); // Un poco más para compensar la aleatoriedad 
    allQs = allQs.concat(generateQuestions('integrador', 15));

    await Question.insertMany(allQs);
    console.log(`¡Se han insertado exitosamente ${allQs.length} preguntas en MongoDB Atlas!`);
    
    process.exit();
  } catch (err) {
    console.error('Error durante el seeder de preguntas:', err);
    process.exit(1);
  }
}

seedQuestions();
