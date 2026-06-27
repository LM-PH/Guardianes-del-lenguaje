const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// Obtener Ranking
router.get('/ranking', playerController.getRanking);

// Obtener datos del jugadores
router.post('/', playerController.createPlayer);
router.get('/:userId', playerController.getPlayer);
// router.put('/:userId', playerController.updatePlayer);
router.patch('/:userId/position', playerController.updatePosition);
// router.patch('/:userId/xp', playerController.updateXP);
// router.patch('/:userId/badge', playerController.addBadge);
router.post('/:userId/battle-result', playerController.processBattleResult);

module.exports = router;
