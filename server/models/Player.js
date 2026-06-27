const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  googleId: {
    type: String
  },
  email: {
    type: String
  },
  nickname: {
    type: String,
    required: true
  },
  character: {
    gender: {
      type: String,
      enum: ['boy', 'girl'],
      required: true
    },
    sprite: {
      type: String,
      default: ''
    }
  },
  pet: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    sprite: { type: String, default: '' }
  },
  xp: {
    type: Number,
    default: 0
  },
  rank: {
    type: String,
    default: "Aprendiz del Lenguaje"
  },
  badges: {
    espanol: { type: Boolean, default: false },
    artes: { type: Boolean, default: false },
    ingles: { type: Boolean, default: false }
  },
  currentMap: {
    type: String,
    default: "pueblo_inicial"
  },
  position: {
    x: { type: Number, default: 5 },
    y: { type: Number, default: 5 }
  },
  completedBattles: [{
    type: String
  }],
  defeatedTeachers: [{
    type: String
  }],
  unlockedFinalMap: {
    type: Boolean,
    default: false
  },
  finalBossDefeated: {
    type: Boolean,
    default: false
  },
  completedGame: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: "Aprendiz del Lenguaje"
  },
  // Estadísticas de combate
  totalBattles: { type: Number, default: 0 },
  victories: { type: Number, default: 0 },
  defeats: { type: Number, default: 0 },
  totalCorrectAnswers: { type: Number, default: 0 },
  totalIncorrectAnswers: { type: Number, default: 0 },
  totalVoiceQuestions: { type: Number, default: 0 },
  voiceQuestionsCorrect: { type: Number, default: 0 },
  voiceQuestionsIncorrect: { type: Number, default: 0 },
  averagePronunciationScore: { type: Number, default: 0 },
  defeatedTeachers: [{ type: String }],
  victoriesBySubject: {
    espanol: { type: Number, default: 0 },
    artes: { type: Number, default: 0 },
    ingles: { type: Number, default: 0 },
    integrador: { type: Number, default: 0 }
  },

  // =====================
  // GLOBAL PROGRESS SYSTEM
  // =====================
  totalXPEarned: { type: Number, default: 0 },
  playerLevel: { type: Number, default: 1 },
  playerRank: { type: String, default: 'Aprendiz del Lenguaje' },
  completedGame: { type: Boolean, default: false },
  finalBossDefeated: { type: Boolean, default: false },
  achievements: [{
    id: { type: String },
    name: { type: String },
    icon: { type: String },
    unlockedAt: { type: Date, default: Date.now }
  }],
  domainProgress: {
    espanol: { xp: { type: Number, default: 0 }, studentsDefeated: { type: Number, default: 0 } },
    artes: { xp: { type: Number, default: 0 }, studentsDefeated: { type: Number, default: 0 } },
    ingles: { xp: { type: Number, default: 0 }, studentsDefeated: { type: Number, default: 0 } },
    integrador: { xp: { type: Number, default: 0 }, studentsDefeated: { type: Number, default: 0 } }
  },
  stats: {
    bestStreak: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    playTimeSeconds: { type: Number, default: 0 }
  },

  // =====================
  // POST-GAME & ECONOMY
  // =====================
  lingocoins: { type: Number, default: 0 },
  inventory: {
    ownedSkins: [{ type: String }],
    ownedPets: [{ type: String }],
    ownedTitles: [{ type: String }],
    collectibles: [{ type: String }],
    equippedSkin: { type: String, default: 'default' },
    equippedPet: { type: String },
    equippedTitle: { type: String },
    openedChests: [{ type: String }]
  }
}, {
  timestamps: true // Esto agrega automáticamente createdAt y updatedAt
});

// Flag virtual
playerSchema.virtual('readyForFinalChallenge').get(function() {
  return this.badges.espanol && this.badges.artes && this.badges.ingles && this.unlockedFinalMap;
});

module.exports = mongoose.model('Player', playerSchema, 'players');
