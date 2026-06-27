// levelSystem.js
// Lógica para calcular niveles, rangos y otorgar logros

const LEVEL_THRESHOLDS = [
  0,      // Nivel 1
  200,    // Nivel 2
  500,    // Nivel 3
  900,    // Nivel 4
  1400,   // Nivel 5
  2000,   // Nivel 6
  2800,   // Nivel 7
  3800,   // Nivel 8
  5000,   // Nivel 9
  6500    // Nivel 10
];

const RANKS = [
  "Aprendiz del Lenguaje",
  "Explorador del Lenguaje",
  "Comunicador",
  "Narrador",
  "Intérprete",
  "Expresionista",
  "Lingüista",
  "Maestro del Lenguaje",
  "Sabio del Lenguaje",
  "Leyenda del Lenguaje"
];

const ACHIEVEMENTS_DB = {
  first_battle: { name: "Primer Combate", icon: "⚔️" },
  win_10: { name: "Derrotar 10 estudiantes", icon: "🥉" },
  win_50: { name: "Derrotar 50 estudiantes", icon: "🥈" },
  win_100: { name: "Derrotar 100 estudiantes", icon: "🥇" },
  win_200: { name: "Derrotar 200 estudiantes", icon: "🏆" },
  first_badge: { name: "Primera Insignia", icon: "🎖️" },
  three_badges: { name: "Tres Insignias", icon: "🌟" },
  first_teacher: { name: "Primer Maestro Derrotado", icon: "👑" },
  perfect_streak_10: { name: "Racha Perfecta (10)", icon: "🔥" },
  pronunciation_master: { name: "Maestro de la Pronunciación", icon: "🎤" }
};

/**
 * Calcula el nivel y el rango basado en el XP total acumulado.
 * @param {Number} totalXP XP total histórico ganado
 * @returns {Object} { level, rank }
 */
function calculateLevelAndRank(totalXP) {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  // Max level is 10
  level = Math.min(level, 10);
  const rank = RANKS[level - 1];
  return { level, rank };
}

/**
 * Evalúa las condiciones para desbloquear nuevos logros.
 * @param {Object} player Documento de mongoose del jugador
 * @returns {Array} Array con los IDs de los logros recién obtenidos
 */
function evaluateAchievements(player) {
  const newAchievements = [];
  const hasAchievement = (id) => player.achievements.some(a => a.id === id);

  const grant = (id) => {
    if (!hasAchievement(id) && ACHIEVEMENTS_DB[id]) {
      player.achievements.push({
        id,
        name: ACHIEVEMENTS_DB[id].name,
        icon: ACHIEVEMENTS_DB[id].icon,
        unlockedAt: new Date()
      });
      newAchievements.push(id);
    }
  };

  if (player.totalBattles >= 1) grant('first_battle');
  if (player.victories >= 10) grant('win_10');
  if (player.victories >= 50) grant('win_50');
  if (player.victories >= 100) grant('win_100');
  if (player.victories >= 200) grant('win_200');

  const badgeCount = (player.badges.espanol ? 1 : 0) + (player.badges.artes ? 1 : 0) + (player.badges.ingles ? 1 : 0);
  if (badgeCount >= 1) grant('first_badge');
  if (badgeCount >= 3) grant('three_badges');

  if (player.defeatedTeachers && player.defeatedTeachers.length >= 1) grant('first_teacher');
  
  if (player.stats.bestStreak >= 10) grant('perfect_streak_10');

  if (player.totalVoiceQuestions >= 10 && player.averagePronunciationScore >= 90) {
    grant('pronunciation_master');
  }

  return newAchievements;
}

module.exports = {
  calculateLevelAndRank,
  evaluateAchievements,
  ACHIEVEMENTS_DB
};
