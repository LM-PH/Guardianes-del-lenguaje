const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

router.get('/catalog', storeController.getCatalog);
router.post('/:userId/buy', storeController.buyItem);
router.post('/:userId/equip', storeController.equipItem);

module.exports = router;
