const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Npc = require('./models/Npc');
const connectDB = require('./config/db');

dotenv.config();

const NAMES = ["Sofía", "Mateo", "Valentina", "Santiago", "Isabella", "Matías", "Camila", "Sebastián", "Valeria", "Nicolás", "Lucía", "Emiliano", "Mariana", "Alejandro", "Renata", "Diego", "Fernanda", "Leonardo", "Ximena", "Daniel", "Romina", "Samuel", "Julieta", "Gael", "Daniela"];

const generateNpc = (map, subject, zone, count, startId, startX, startY, gridWidth, gridHeight) => {
  const npcs = [];
  // Para distribuir en el grid
  let currentX = startX;
  let currentY = startY;

  for (let i = 0; i < count; i++) {
    // Determinar dificultad (1: 50%, 2: 30%, 3: 20%)
    const rand = Math.random();
    let difficulty = 1;
    let xpReward = 10;
    if (rand > 0.8) {
      difficulty = 3;
      xpReward = 40;
    } else if (rand > 0.5) {
      difficulty = 2;
      xpReward = 20;
    }

    const name = NAMES[Math.floor(Math.random() * NAMES.length)] + " " + (i+1);

    npcs.push({
      npcId: `${map}_npc_${startId + i}`,
      name,
      map,
      zone,
      subject,
      x: currentX,
      y: currentY,
      difficulty,
      xpReward,
      defeatedBy: []
    });

    // Mover posición para el siguiente NPC
    currentX += 3;
    if (currentX > startX + gridWidth) {
      currentX = startX;
      currentY += 3;
    }
  }
  return npcs;
}

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Limpiando colección NPCs anterior...');
    await Npc.deleteMany();

    console.log('Generando NPCs...');
    let allNpcs = [];

    // MAPA ESPAÑOL (50 total)
    // Zona 1: Ortografía (15)
    allNpcs = allNpcs.concat(generateNpc("mapa_espanol", "espanol", "Ortografía", 15, 1, 2, 2, 10, 10));
    // Zona 2: Comprensión lectora (15)
    allNpcs = allNpcs.concat(generateNpc("mapa_espanol", "espanol", "Comprensión lectora", 15, 16, 20, 2, 10, 10));
    // Zona 3: Literatura (10)
    allNpcs = allNpcs.concat(generateNpc("mapa_espanol", "espanol", "Literatura", 10, 31, 2, 15, 10, 10));
    // Zona 4: Producción de textos (10)
    allNpcs = allNpcs.concat(generateNpc("mapa_espanol", "espanol", "Producción de textos", 10, 41, 20, 15, 10, 10));

    // MAPA ARTES (50 total)
    allNpcs = allNpcs.concat(generateNpc("mapa_artes", "artes", "Artes visuales", 15, 1, 2, 2, 10, 10));
    allNpcs = allNpcs.concat(generateNpc("mapa_artes", "artes", "Música", 15, 16, 20, 2, 10, 10));
    allNpcs = allNpcs.concat(generateNpc("mapa_artes", "artes", "Danza", 10, 31, 2, 15, 10, 10));
    allNpcs = allNpcs.concat(generateNpc("mapa_artes", "artes", "Teatro", 10, 41, 20, 15, 10, 10));

    // MAPA INGLÉS (50 total)
    allNpcs = allNpcs.concat(generateNpc("mapa_ingles", "ingles", "Vocabulary", 15, 1, 2, 2, 10, 10));
    allNpcs = allNpcs.concat(generateNpc("mapa_ingles", "ingles", "Grammar", 15, 16, 20, 2, 10, 10));
    allNpcs = allNpcs.concat(generateNpc("mapa_ingles", "ingles", "Reading", 10, 31, 2, 15, 10, 10));
    allNpcs = allNpcs.concat(generateNpc("mapa_ingles", "ingles", "Listening", 10, 41, 20, 15, 10, 10));

    // MAPA CIUDAD DE LOS MAESTROS (50 total - integrador)
    allNpcs = allNpcs.concat(generateNpc("ciudad_maestros", "integrador", "Comunicación Escrita", 10, 1, 2, 2, 10, 10));
    allNpcs = allNpcs.concat(generateNpc("ciudad_maestros", "integrador", "Comunicación Artística", 10, 11, 20, 2, 10, 10));
    allNpcs = allNpcs.concat(generateNpc("ciudad_maestros", "integrador", "Comunicación Internacional", 10, 21, 2, 15, 10, 10));
    allNpcs = allNpcs.concat(generateNpc("ciudad_maestros", "integrador", "Interpretación y Análisis", 10, 31, 20, 15, 10, 10));
    allNpcs = allNpcs.concat(generateNpc("ciudad_maestros", "integrador", "Retos Integradores", 10, 41, 2, 25, 10, 10));

    await Npc.insertMany(allNpcs);
    console.log(`¡Se han insertado exitosamente ${allNpcs.length} NPCs en MongoDB Atlas!`);
    
    process.exit();
  } catch (err) {
    console.error('Error durante el seeder:', err);
    process.exit(1);
  }
}

seedDatabase();
