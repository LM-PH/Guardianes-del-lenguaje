// storeConfig.js
// Catálogo de artículos disponibles en la Tienda del Lenguaje

const catalog = {
  skins: [
    { id: 'skin_explorador', name: 'Explorador', category: 'Explorador', price: 100, sprite: '🤠', rarity: 'Común' },
    { id: 'skin_bibliotecario', name: 'Bibliotecario', category: 'Bibliotecario', price: 150, sprite: '🤓', rarity: 'Poco común' },
    { id: 'skin_artista', name: 'Artista', category: 'Artista', price: 200, sprite: '🧑‍🎨', rarity: 'Rara' },
    { id: 'skin_traductor', name: 'Traductor', category: 'Traductor', price: 200, sprite: '🗣️', rarity: 'Rara' },
    { id: 'skin_maestro', name: 'Maestro', category: 'Maestro', price: 500, sprite: '🧑‍🏫', rarity: 'Épica' },
    { id: 'skin_sabio', name: 'Sabio', category: 'Sabio', price: 1000, sprite: '🧙', rarity: 'Legendaria' }
  ],
  pets: [
    { id: 'pet_panda', name: 'Panda', price: 300, sprite: '🐼', rarity: 'Rara' },
    { id: 'pet_dragon', name: 'Dragón de tinta', price: 1500, sprite: '🐉', rarity: 'Legendaria' },
    { id: 'pet_colibri', name: 'Colibrí del lenguaje', price: 800, sprite: '🐦', rarity: 'Épica' }
  ],
  titles: [
    { id: 'title_explorador', name: 'Explorador de Palabras', price: 50, rarity: 'Común' },
    { id: 'title_artista_emergente', name: 'Artista Emergente', price: 100, rarity: 'Poco común' },
    { id: 'title_comunicador', name: 'Comunicador Global', price: 150, rarity: 'Rara' },
    { id: 'title_cazador', name: 'Cazador de Secretos', price: 300, rarity: 'Épica' }
  ]
};

module.exports = catalog;
