const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Npc = require('./models/Npc');
const Question = require('./models/Question');
const connectDB = require('./config/db');
const generateUniqueQuestions = require('./utils/generateQuestionsPool');

dotenv.config();

const TILE_SIZE = 32;

const mapConfigs = {
  pueblo_inicial: {
    mapName: 'pueblo_inicial',
    width: 50, height: 50,
    subject: 'espanol', // usan pool de español para empezar
    zones: ['Ortografía', 'Comprensión lectora'],
    counts: [10, 10]
  },
  espanol: {
    mapName: 'mapa_espanol',
    width: 100, height: 100,
    subject: 'espanol',
    zones: ['Ortografía', 'Comprensión lectora', 'Literatura', 'Producción de textos'],
    counts: [15, 15, 10, 10]
  },
  artes: {
    mapName: 'mapa_artes',
    width: 100, height: 100,
    subject: 'artes',
    zones: ['Artes visuales', 'Música', 'Danza', 'Teatro'],
    counts: [15, 15, 10, 10]
  },
  ingles: {
    mapName: 'mapa_ingles',
    width: 100, height: 100,
    subject: 'ingles',
    zones: ['Vocabulary', 'Grammar', 'Reading', 'Listening'],
    counts: [15, 15, 10, 10]
  },
  integrador: {
    mapName: 'ciudad_maestros',
    width: 100, height: 100,
    subject: 'integrador',
    zones: ['Comunicación Escrita', 'Comunicación Artística', 'Comunicación Internacional', 'Interpretación y Análisis', 'Retos Integradores'],
    counts: [10, 10, 10, 10, 10]
  }
};

const generateNPCsAndQuestions = async () => {
  try {
    await connectDB();
    console.log('Limpiando base de datos (NPCs y Questions)...');
    await Npc.deleteMany();
    await Question.deleteMany();

    const allNpcs = [];
    const allQuestions = [];
    
    // Create the unique pools using the generator
    const questionsPool = generateUniqueQuestions();
    
    let npcCounter = 1;
    let questionCounter = 1;

    for (const [key, config] of Object.entries(mapConfigs)) {
      console.log(`Generando datos para: ${config.mapName}...`);
      
      for (let z = 0; z < config.zones.length; z++) {
        const zoneName = config.zones[z];
        const countInZone = config.counts[z];
        const zonePool = [...(questionsPool[config.subject]?.[zoneName] || [])];
        zonePool.sort(() => 0.5 - Math.random());

        for (let i = 0; i < countInZone; i++) {
          const npcId = `${config.mapName}_npc_${npcCounter}`;
          
          // Dificultad incremental basada en el índice de la zona
          const difficulty = z < 2 ? 1 : (z === 2 ? 2 : 3);
          const xpReward = difficulty === 1 ? 10 : (difficulty === 2 ? 20 : 40);

          // Exactamente 4 preguntas por NPC
          let qCountToAssign = 4;

          // No longer needed to grab again from questionsPool since zonePool is available outside the loop
          const questionIdsForNpc = [];
          
          for (let q = 0; q < qCountToAssign; q++) {
            const qId = `q_${npcCounter}_${questionCounter++}`;
            questionIdsForNpc.push(qId);
            
            // Pop the question to guarantee no duplicates
            if (zonePool.length === 0) {
               console.error(`ERROR: Ran out of questions for ${config.subject} in zone ${zoneName}!`);
               break;
            }
            let poolQuestion = zonePool.pop();

            // Adaptar dificultad dinámicamente eliminando opciones incorrectas y barajando
            let finalOptions = [...(poolQuestion.options || [])];
            let finalCorrectAnswer = poolQuestion.correctAnswer;
            
            if (poolQuestion.type !== 'voice' && finalOptions.length === 4) {
              const correctOpt = finalOptions[finalCorrectAnswer];
              let incorrectOpts = finalOptions.map((opt, idx) => ({ opt, idx })).filter(item => item.idx !== finalCorrectAnswer);
              
              // Siempre mantener las 4 opciones
              const optionsToMix = [{ opt: correctOpt, isCorrect: true }, ...incorrectOpts.map(i => ({ opt: i.opt, isCorrect: false }))];
              optionsToMix.sort(() => 0.5 - Math.random());
              
              finalOptions = optionsToMix.map(item => item.opt);
              finalCorrectAnswer = optionsToMix.findIndex(item => item.isCorrect);
            }

            let finalQuestionText = poolQuestion.question;

            allQuestions.push({
              questionId: qId,
              npcId: npcId,
              subject: config.subject,
              map: config.mapName,
              zone: zoneName,
              topic: zoneName,
              type: poolQuestion.type || 'multiple_choice',
              difficulty: difficulty,
              question: finalQuestionText,
              options: finalOptions,
              correctAnswer: finalCorrectAnswer !== undefined ? finalCorrectAnswer : null,
              expectedAnswer: poolQuestion.expectedAnswer || null,
              keywords: [],
              explanation: poolQuestion.explanation
            });
          }

          // Distribuir correctamente por el tamaño real del mapa, evitando los bordes
          const w = config.width - 4;
          const h = config.height - 4;
          allNpcs.push({
            npcId: npcId,
            name: `Estudiante ${npcCounter}`,
            map: config.mapName,
            zone: zoneName,
            x: Math.floor(Math.random() * w) + 2,
            y: Math.floor(Math.random() * h) + 2,
            subject: config.subject,
            difficulty: difficulty,
            xpReward: xpReward,
            defeatedBy: [],
            questionIds: questionIdsForNpc
          });

          npcCounter++;
        }
      }
    }

    console.log(`Insertando ${allNpcs.length} NPCs...`);
    await Npc.insertMany(allNpcs);

    // ============================================
    // SECCIÓN JEFES (TEACHERS)
    // ============================================
    const Teacher = require('./models/Teacher');
    console.log('Limpiando y Generando Maestros...');
    await Teacher.deleteMany();

    const teachersData = [
      {
        teacherId: 'maestro_espanol',
        name: 'Maestro de la Palabra',
        title: 'Gran Sabio de Español',
        subject: 'espanol',
        map: 'mapa_espanol',
        schoolName: 'Escuela de Español',
        badgeReward: 'Insignia de la Palabra',
        requiredXp: 700,
        requiredDefeatedStudents: 35,
        difficulty: 3,
        questionIds: [],
        defeatedBy: []
      },
      {
        teacherId: 'maestro_artes',
        name: 'Maestro de la Expresión',
        title: 'Gran Artista',
        subject: 'artes',
        map: 'mapa_artes',
        schoolName: 'Escuela de Artes',
        badgeReward: 'Insignia de la Expresión',
        requiredXp: 700,
        requiredDefeatedStudents: 35,
        difficulty: 3,
        questionIds: [],
        defeatedBy: []
      },
      {
        teacherId: 'maestro_ingles',
        name: 'Maestro de la Comunicación',
        title: 'International Master',
        subject: 'ingles',
        map: 'mapa_ingles',
        schoolName: 'Escuela de Inglés',
        badgeReward: 'Insignia de la Comunicación',
        requiredXp: 700,
        requiredDefeatedStudents: 35,
        difficulty: 3,
        questionIds: [],
        defeatedBy: []
      },
      {
        teacherId: 'gran_maestro_lenguaje',
        name: 'Gran Maestro del Lenguaje',
        title: 'Leyenda del Lenguaje',
        subject: 'integrador',
        map: 'ciudad_maestros',
        schoolName: 'Gran Academia del Lenguaje',
        badgeReward: 'Certificado Gran Maestro',
        requiredXp: 2500,
        requiredDefeatedStudents: 35, // 35 integradores
        difficulty: 4,
        questionIds: [],
        defeatedBy: []
      }
    ];

    const teacherDocs = [];
    for (const t of teachersData) {
      const qIds = [];
      const isFinalBoss = t.teacherId === 'gran_maestro_lenguaje';
      const questionCount = isFinalBoss ? 20 : 15;

      // Recopilar todas las preguntas de la materia del maestro
      let teacherSubjectPool = [];
      const subjectPoolObj = questionsPool[t.subject] || {};
      for (const zoneQs of Object.values(subjectPoolObj)) {
        teacherSubjectPool = teacherSubjectPool.concat(zoneQs);
      }

      if (teacherSubjectPool.length === 0) {
        teacherSubjectPool = [{
          question: `Pregunta de maestría para ${t.name}`,
          options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
          correctAnswer: 1,
          explanation: 'Esta es una explicación de maestría.'
        }];
      }

      teacherSubjectPool.sort(() => 0.5 - Math.random());

      for(let i=0; i<questionCount; i++) {
        const qId = `boss_${t.teacherId}_q_${i+1}`;
        qIds.push(qId);
        
        const poolIndex = i % teacherSubjectPool.length;
        const poolQuestion = teacherSubjectPool[poolIndex];

        allQuestions.push({
          questionId: qId,
          npcId: t.teacherId,
          subject: t.subject,
          map: t.map,
          zone: t.schoolName,
          topic: 'Boss Battle',
          type: poolQuestion.type || 'multiple_choice',
          difficulty: isFinalBoss ? 4 : 3,
          question: poolQuestion.question,
          options: poolQuestion.options || [],
          correctAnswer: poolQuestion.correctAnswer !== undefined ? poolQuestion.correctAnswer : null,
          expectedAnswer: poolQuestion.expectedAnswer || null,
          keywords: [],
          explanation: poolQuestion.explanation
        });
      }
      t.questionIds = qIds;
      teacherDocs.push(t);
    }

    await Teacher.insertMany(teacherDocs);
    console.log(`Insertados ${teacherDocs.length} Maestros.`);

    console.log(`Insertando ${allQuestions.length} Preguntas...`);
    // Insertar en chunks para no desbordar memoria si es muy grande
    const chunkSize = 500;
    for (let i = 0; i < allQuestions.length; i += chunkSize) {
      const chunk = allQuestions.slice(i, i + chunkSize);
      await Question.insertMany(chunk);
    }
    
    console.log('Redistribuyendo NPCs entre pisos y submapas...');
    require('child_process').execSync('node redistributeNpcs.js', { stdio: 'inherit' });

    console.log('¡Generación masiva completada exitosamente!');
    process.exit();

  } catch (error) {
    console.error('Error durante la generación masiva:', error);
    process.exit(1);
  }
};

generateNPCsAndQuestions();
