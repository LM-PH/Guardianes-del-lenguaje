const Player = require('../models/Player');
const storeConfig = require('../config/storeConfig');

// Obtener catálogo
exports.getCatalog = (req, res) => {
  res.json(storeConfig);
};

// Comprar un item
exports.buyItem = async (req, res) => {
  try {
    const { userId } = req.params;
    const { itemType, itemId } = req.body; // itemType: 'skins', 'pets', 'titles'

    const player = await Player.findOne({ userId });
    if (!player) return res.status(404).json({ message: 'Jugador no encontrado' });

    // Buscar item en catálogo
    const catalogList = storeConfig[itemType];
    if (!catalogList) return res.status(400).json({ message: 'Tipo de item inválido' });

    const item = catalogList.find(i => i.id === itemId);
    if (!item) return res.status(404).json({ message: 'Item no encontrado en catálogo' });

    // Verificar si ya lo tiene
    let ownedList = [];
    if (itemType === 'skins') ownedList = player.inventory.ownedSkins;
    if (itemType === 'pets') ownedList = player.inventory.ownedPets;
    if (itemType === 'titles') ownedList = player.inventory.ownedTitles;

    if (ownedList.includes(itemId)) {
      return res.status(400).json({ message: 'Ya posees este item' });
    }

    // Verificar monedas
    if (player.lingocoins < item.price) {
      return res.status(400).json({ message: 'Lingocoins insuficientes' });
    }

    // Comprar
    player.lingocoins -= item.price;
    ownedList.push(itemId);
    
    await player.save();
    res.json({ message: 'Compra exitosa', player });
  } catch (error) {
    res.status(500).json({ message: 'Error en la compra', error: error.message });
  }
};

// Equipar un item
exports.equipItem = async (req, res) => {
  try {
    const { userId } = req.params;
    const { itemType, itemId } = req.body;

    const player = await Player.findOne({ userId });
    if (!player) return res.status(404).json({ message: 'Jugador no encontrado' });

    if (itemType === 'skins') {
      if (!player.inventory.ownedSkins.includes(itemId) && itemId !== 'default') {
        return res.status(400).json({ message: 'No posees esta skin' });
      }
      player.inventory.equippedSkin = itemId;
    } else if (itemType === 'pets') {
      if (!player.inventory.ownedPets.includes(itemId)) {
        return res.status(400).json({ message: 'No posees esta mascota' });
      }
      player.inventory.equippedPet = itemId;
    } else if (itemType === 'titles') {
      if (!player.inventory.ownedTitles.includes(itemId)) {
        return res.status(400).json({ message: 'No posees este título' });
      }
      player.inventory.equippedTitle = itemId;
    } else {
      return res.status(400).json({ message: 'Tipo inválido para equipar' });
    }

    await player.save();
    res.json({ message: 'Equipado exitosamente', player });
  } catch (error) {
    res.status(500).json({ message: 'Error al equipar', error: error.message });
  }
};
