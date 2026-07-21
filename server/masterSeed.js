const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Npc = require('./models/Npc');
const Question = require('./models/Question');
const connectDB = require('./config/db');
const questionsPool = require('./utils/questionsData');

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

          // Determinar cantidad de preguntas a asignar
          let qCountToAssign = 8;
          if (difficulty === 2) qCountToAssign = 10;
          if (difficulty === 3) qCountToAssign = 12;

          const zonePool = questionsPool[config.subject]?.[zoneName] || [];
          const questionIdsForNpc = [];

          // Barajar el pool para este PNJ
          const shuffledPool = [...zonePool].sort(() => 0.5 - Math.random());

          const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
          
          for (let q = 0; q < qCountToAssign; q++) {
            const qId = `q_${npcCounter}_${questionCounter++}`;
            questionIdsForNpc.push(qId);
            
            // Mezclamos preguntas fijas con preguntas generadas por dificultad para evitar repetición
            let poolQuestion;
            if (q < 2 && shuffledPool[q]) { 
              poolQuestion = shuffledPool[q]; // Usar un par fijas como base
            } else {
              // Generar preguntas dependientes 100% de la dificultad del estudiante
              if (config.subject === 'espanol') {
                 if (difficulty === 1) {
                    const w = randItem([{c:"camión",w:"camion"}, {c:"lápiz",w:"lapiz"}, {c:"árbol",w:"arbol"}, {c:"corazón",w:"corazon"}, {c:"canción",w:"cancion"}]);
                    poolQuestion = { question: `¿Cómo se escribe correctamente?`, options: [w.c, w.w, w.w+"s", w.c+"s"], correctAnswer: 0, explanation: `La palabra lleva tilde.` };
                 } else if (difficulty === 2) {
                    const v = randItem([{v:"cantar", c:"cantaba", w:"cantava"}, {v:"ir", c:"iba", w:"iva"}, {v:"haber", c:"había", w:"havía"}]);
                    poolQuestion = { question: `Pretérito imperfecto de ${v.v}:`, options: [v.c, v.w, v.c+"n", v.w+"s"], correctAnswer: 0, explanation: `Regla de la B y V.` };
                 } else {
                    const s = randItem(['La casa blanca', 'El perro rápido', 'Un gato perezoso', 'El ave veloz']);
                    poolQuestion = { question: `En "${s}", ¿cuál es el adjetivo?`, options: [s.split(' ')[2], s.split(' ')[1], s.split(' ')[0], "Ninguno"], correctAnswer: 0, explanation: `El adjetivo describe al sustantivo.` };
                 }
              } else if (config.subject === 'ingles') {
                 if (difficulty === 1) {
                    const w = randItem([{e:"apple",s:"manzana"}, {e:"dog",s:"perro"}, {e:"cat",s:"gato"}, {e:"book",s:"libro"}]);
                    poolQuestion = { question: `Translate "${w.s}":`, options: [w.e, w.e+"s", "the "+w.e, "a "+w.e], correctAnswer: 0, explanation: `Vocabulario básico.` };
                 } else if (difficulty === 2) {
                    const v = randItem([{e:"went",s:"fui"}, {e:"ate",s:"comí"}, {e:"saw",s:"vi"}, {e:"ran",s:"corrí"}]);
                    poolQuestion = { question: `Past tense for "${v.s}":`, options: [v.e, v.e+"ed", "was "+v.e, "has "+v.e], correctAnswer: 0, explanation: `Verbos irregulares.` };
                 } else {
                    poolQuestion = { question: `Choose correct:`, options: ["I have been there.", "I has been there.", "I have being there.", "I was been there."], correctAnswer: 0, explanation: `Present perfect tense.` };
                 }
              } else {
                 if (difficulty === 1) {
                    poolQuestion = { question: `Colores primarios incluyen:`, options: ["Rojo", "Verde", "Naranja", "Morado"], correctAnswer: 0, explanation: `Rojo, azul y amarillo.` };
                 } else {
                    const a = randItem(["Van Gogh", "Picasso", "Da Vinci", "Dalí", "Monet"]);
                    poolQuestion = { question: `¿Pintor famoso?`, options: [a, "Beethoven", "Mozart", "Shakespeare"], correctAnswer: 0, explanation: `Es un pintor reconocido.` };
                 }
              }
            }

            // Adaptar dificultad dinámicamente eliminando opciones incorrectas y barajando
            let finalOptions = [...(poolQuestion.options || [])];
            let finalCorrectAnswer = poolQuestion.correctAnswer;
            
            if (poolQuestion.type !== 'voice' && finalOptions.length === 4) {
              const correctOpt = finalOptions[finalCorrectAnswer];
              let incorrectOpts = finalOptions.map((opt, idx) => ({ opt, idx })).filter(item => item.idx !== finalCorrectAnswer);
              
              // Nivel 1: Dejar solo 2 opciones (1 correcta, 1 incorrecta)
              // Nivel 2: Dejar solo 3 opciones (1 correcta, 2 incorrectas)
              // Nivel 3: Dejar las 4 opciones
              if (difficulty === 1) {
                incorrectOpts = incorrectOpts.sort(() => 0.5 - Math.random()).slice(0, 1);
              } else if (difficulty === 2) {
                incorrectOpts = incorrectOpts.sort(() => 0.5 - Math.random()).slice(0, 2);
              }
              
              // Reconstruir las opciones y mezclarlas
              const optionsToMix = [{ opt: correctOpt, isCorrect: true }, ...incorrectOpts.map(i => ({ opt: i.opt, isCorrect: false }))];
              optionsToMix.sort(() => 0.5 - Math.random());
              
              finalOptions = optionsToMix.map(item => item.opt);
              finalCorrectAnswer = optionsToMix.findIndex(item => item.isCorrect);
            }

            // Para que se vean "diferentes", le agregamos una ligera variación o el nombre del alumno al inicio
            const isVoice = poolQuestion.type === 'voice';
            let finalQuestionText = poolQuestion.question;
            if (!isVoice) {
               const variations = [
                 `¡Demuestra lo que sabes! ${finalQuestionText}`,
                 `Pregunta para ti: ${finalQuestionText}`,
                 `A ver si sabes esto: ${finalQuestionText}`,
                 `El desafío del Estudiante ${npcCounter}: ${finalQuestionText}`,
                 `${finalQuestionText}`,
                 `Concéntrate: ${finalQuestionText}`
               ];
               finalQuestionText = variations[Math.floor(Math.random() * variations.length)];
            }

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
    
    console.log('¡Generación masiva completada exitosamente!');
    process.exit();

  } catch (error) {
    console.error('Error durante la generación masiva:', error);
    process.exit(1);
  }
};

generateNPCsAndQuestions();
