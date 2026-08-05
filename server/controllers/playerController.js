const Player = require('../models/Player');

// Obtener o crear jugador (para efectos de demo)
exports.getPlayer = async (req, res) => {
  try {
    let player = await Player.findOne({ userId: req.params.userId });
    if (!player) {
      return res.status(404).json({ message: 'Jugador no encontrado' });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || 'zlagustin10@gmail.com').toLowerCase();
    if (player.email && player.email.toLowerCase() === adminEmail) {
      if (!player.isAdmin) {
        player.isAdmin = true;
        await player.save();
      }
    }

    res.json(player);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

// Crear jugador (nuevo)
exports.createPlayer = async (req, res) => {
  try {
    const { googleId, email, nickname, character, pet } = req.body;
    const userId = googleId || `user_${Date.now()}`;
    const adminEmail = (process.env.ADMIN_EMAIL || 'zlagustin10@gmail.com').toLowerCase();
    const isAdmin = email && email.toLowerCase() === adminEmail;

    const newPlayer = new Player({
      userId,
      googleId,
      email,
      isAdmin,
      nickname,
      character,
      pet
    });
    
    const savedPlayer = await newPlayer.save();
    
    const jwtSecret = process.env.JWT_SECRET || 'guardianes_secreto_super_seguro_2024';
    const jwt = require('jsonwebtoken');
    const authToken = jwt.sign({ userId: savedPlayer.userId, googleId: savedPlayer.googleId }, jwtSecret, { expiresIn: '30d' });

    res.status(201).json({ player: savedPlayer, token: authToken });
  } catch (error) {
    res.status(400).json({ message: 'Error al crear jugador', error: error.message });
  }
};

// Actualizar posición
exports.updatePosition = async (req, res) => {
  try {
    const { currentMap, x, y } = req.body;
    const player = await Player.findOneAndUpdate(
      { userId: req.params.userId },
      { 
        currentMap,
        position: { x, y }
      },
      { new: true }
    );
    if (!player) return res.status(404).json({ message: 'Jugador no encontrado' });
    res.json(player);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar posición', error: error.message });
  }
};

// Procesar resultado de batalla
exports.processBattleResult = async (req, res) => {
  try {
    const { win, xpGained, corrects, incorrects, npcId, voiceStats, isBoss, subject } = req.body;
    const player = await Player.findOne({ userId: req.params.userId });
    if (!player) return res.status(404).json({ message: 'Jugador no encontrado' });

    // Actualizar estadísticas básicas
    player.totalBattles += 1;
    player.totalCorrectAnswers += (corrects || 0);
    player.totalIncorrectAnswers += (incorrects || 0);
    
    // Estadísticas de voz
    if (voiceStats) {
      player.totalVoiceQuestions += (voiceStats.total || 0);
      player.voiceQuestionsCorrect += (voiceStats.correct || 0);
      player.voiceQuestionsIncorrect += (voiceStats.incorrect || 0);
      
      // Actualizar promedio simple
      if (voiceStats.scoreSum && voiceStats.total > 0) {
        const currentTotalScore = player.averagePronunciationScore * (player.totalVoiceQuestions - voiceStats.total);
        player.averagePronunciationScore = (currentTotalScore + voiceStats.scoreSum) / player.totalVoiceQuestions;
      }
    }

    if (win) {
      player.victories += 1;
      player.xp += (xpGained || 0);
      player.totalXPEarned += (xpGained || 0);
      
      // Rachas
      player.stats.currentStreak += 1;
      if (player.stats.currentStreak > player.stats.bestStreak) {
        player.stats.bestStreak = player.stats.currentStreak;
      }
      
      if (subject && player.victoriesBySubject[subject] !== undefined && !isBoss) {
        player.victoriesBySubject[subject] += 1;
        // Registrar en domainProgress
        player.domainProgress[subject].xp += (xpGained || 0);
        player.domainProgress[subject].studentsDefeated += 1;
      }

      if (isBoss && npcId) {
        if (!player.defeatedTeachers.includes(npcId)) {
          player.defeatedTeachers.push(npcId);
          // Otorgar insignia
          if (npcId === 'maestro_espanol') player.badges.espanol = true;
          if (npcId === 'maestro_artes') player.badges.artes = true;
          if (npcId === 'maestro_ingles') player.badges.ingles = true;

          if (npcId === 'gran_maestro_lenguaje') {
            player.finalBossDefeated = true;
            player.completedGame = true;
            player.title = "Gran Maestro del Lenguaje";
          }
        }
      } else if (npcId && !player.completedBattles.includes(npcId)) {
        player.completedBattles.push(npcId);
      }
    } else {
      player.defeats += 1;
      player.xp = Math.max(0, player.xp - (isBoss ? 20 : 5)); // Penalización
      player.stats.currentStreak = 0; // Reset racha
    }
    
    // Evaluar Nivel y Rango
    const { level, rank } = require('../utils/levelSystem').calculateLevelAndRank(player.totalXPEarned);
    player.playerLevel = level;
    if (player.title !== "Gran Maestro del Lenguaje") {
      player.playerRank = rank;
    }

    // Evaluar Logros
    const newAchievements = require('../utils/levelSystem').evaluateAchievements(player);

    let earnedCoins = 0;
    if (win) {
      if (isBoss) {
        earnedCoins += npcId === 'gran_maestro_lenguaje' ? 500 : 100;
      } else {
        const diff = Number(req.body.difficulty || 1);
        if (diff === 1) earnedCoins += 5;
        else if (diff === 2) earnedCoins += 10;
        else earnedCoins += 20;
      }
    }

    if (newAchievements.length > 0) {
      // Recompensar logros (simplificado a 50 monedas por logro)
      earnedCoins += (newAchievements.length * 50);
    }

    player.lingocoins += earnedCoins;

    await player.save();
    res.json({ player, newAchievements, earnedCoins });
  } catch (error) {
    res.status(500).json({ message: 'Error procesando resultado', error: error.message });
  }
};

// Obtener ranking
exports.getRanking = async (req, res) => {
  try {
    const players = await Player.find({}, 'nickname playerLevel playerRank totalXPEarned averagePronunciationScore completedGame inventory')
      .sort({ totalXPEarned: -1, averagePronunciationScore: -1 })
      .limit(50);
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo ranking', error: error.message });
  }
};

// Activar Modo Dios (Dev/Test mode)
exports.devGodMode = async (req, res) => {
  try {
    let player = await Player.findOne({ userId: req.params.userId });
    if (!player) return res.status(404).json({ message: 'Jugador no encontrado' });

    const adminEmail = (process.env.ADMIN_EMAIL || 'zlagustin10@gmail.com').toLowerCase();
    const isOwner = player.isAdmin || (player.email && player.email.toLowerCase() === adminEmail);

    if (!isOwner) {
      return res.status(403).json({ message: `Acceso denegado: El Modo Dios está reservado exclusivamente para el correo de administrador (${adminEmail}).` });
    }

    player.isAdmin = true;
    player.lingocoins = 999999;
    player.xp = 99999;
    player.totalXPEarned = 99999;
    player.playerLevel = 99;
    player.playerRank = 'Gran Maestro Legendario';
    player.title = 'Gran Maestro del Lenguaje';
    player.badges = { espanol: true, artes: true, ingles: true };
    player.unlockedFinalMap = true;
    player.completedGame = true;
    player.finalBossDefeated = true;

    player.domainProgress = {
      espanol: { xp: 9999, studentsDefeated: 50 },
      artes: { xp: 9999, studentsDefeated: 50 },
      ingles: { xp: 9999, studentsDefeated: 50 },
      integrador: { xp: 9999, studentsDefeated: 50 }
    };

    player.victoriesBySubject = {
      espanol: 50,
      artes: 50,
      ingles: 50,
      integrador: 50
    };

    player.inventory.ownedSkins = ['skin_explorador', 'skin_bibliotecario', 'skin_artista', 'skin_maestro', 'skin_sabio'];
    player.inventory.ownedPets = ['pet_gatito', 'pet_perrito', 'pet_zorrito', 'pet_dragon'];
    player.inventory.ownedTitles = ['title_novato', 'title_estudiante', 'title_guardian', 'title_erudito', 'title_leyenda'];

    await player.save();
    res.json({ message: `⚡ ¡Modo Dios activado con éxito para ${player.email}!`, player });
  } catch (error) {
    res.status(500).json({ message: 'Error al activar Modo Dios', error: error.message });
  }
};
