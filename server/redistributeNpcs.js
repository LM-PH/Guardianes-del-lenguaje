const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Npc = require('./models/Npc');

dotenv.config({ path: './.env' }); // Run from inside server directory

const TILES = {
  GRASS: 0, WATER: 1, TREE: 2, PATH: 3, WALL: 5, FLOOR: 6, FLOWER: 7,
  HOUSE_DOOR: 8, HOUSE_EXIT: 9, HOUSE: 10, HOUSE_WALL: 11,
  CAVE_FLOOR: 12, CAVE_WALL: 13, WOOD_FLOOR: 14, BOOKSHELF: 15
};

const SOLID_TILES = [TILES.WATER, TILES.TREE, TILES.WALL, TILES.HOUSE, TILES.HOUSE_WALL, TILES.CAVE_WALL, TILES.BOOKSHELF];

const generateNoise = (x, y, seed) => {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
};

const getMapGrid = (mapName, width, height) => {
  let baseTile = TILES.GRASS;
  let isCave = mapName.startsWith('cueva_');
  let isTower = mapName.startsWith('torre_');
  
  if (isCave) baseTile = TILES.CAVE_FLOOR;
  else if (isTower) baseTile = TILES.WOOD_FLOOR;

  const grid = Array(height).fill(null).map(() => Array(width).fill(baseTile));
  const seed = mapName.length + 7;

  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        if (mapName === 'pueblo_inicial') {
          if ((x === 0 && y === cy) || (x === width - 1 && y === cy) || (x === cx && y === height - 1) || (x === cx && y === 0)) {
            grid[y][x] = TILES.PATH;
            continue;
          }
        }
        if (isCave) grid[y][x] = TILES.CAVE_WALL;
        else if (isTower) grid[y][x] = TILES.WALL;
        else grid[y][x] = TILES.WATER;
      }
    }
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const maxDist = Math.min(width, height) / 2;
      const n = generateNoise(x, y, seed);

      if (isCave) {
        if (n > 0.45 && dist > 3) grid[y][x] = TILES.CAVE_WALL;
      } else if (isTower) {
        if (x % 4 === 0 && y % 3 !== 0 && dist > 3) grid[y][x] = TILES.BOOKSHELF;
      } else {
        if (dist > maxDist * 0.65 && n > 0.35) grid[y][x] = TILES.TREE;
        else if (dist > maxDist * 0.3 && n > 0.88) grid[y][x] = TILES.TREE;
        else if (n > 0.84 && n <= 0.88) grid[y][x] = TILES.FLOWER;
      }
    }
  }

  // 3. Cruz principal de caminos (libre de obstáculos)
  for (let x = 0; x < width; x++) {
    grid[cy - 1][x] = TILES.PATH;
    grid[cy][x]     = TILES.PATH;
    grid[cy + 1][x] = TILES.PATH;
  }
  for (let y = 0; y < height; y++) {
    grid[y][cx - 1] = TILES.PATH;
    grid[y][cx]     = TILES.PATH;
    grid[y][cx + 1] = TILES.PATH;
  }

  // 4. Academia central en reinos
  if (mapName !== 'pueblo_inicial') {
    const R = 8;
    for (let sy = cy - R; sy <= cy + R; sy++) {
      for (let sx = cx - R; sx <= cx + R; sx++) {
        if (sy < 1 || sy >= height - 1 || sx < 1 || sx >= width - 1) continue;
        const isEdge = sy === cy - R || sy === cy + R || sx === cx - R || sx === cx + R;
        if (isEdge) {
          if ((sx === cx || sx === cx - 1 || sx === cx + 1) &&
              (sy === cy + R || sy === cy - R)) {
            grid[sy][sx] = TILES.PATH;
          } else {
            grid[sy][sx] = TILES.WALL;
          }
        } else {
          grid[sy][sx] = TILES.FLOOR;
        }
      }
    }
  }

  return grid;
};

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('No MONGODB_URI found in env');
      process.exit(1);
    }
    await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME || 'guardianes_lenguaje' });
    console.log('Conectado a la BD para redistribuir NPCs...');

    const domains = ['espanol', 'artes', 'ingles'];
    
    for (const domain of domains) {
      // Find all NPCs associated with this domain
      const npcs = await Npc.find({ 
        $or: [
          { map: `mapa_${domain}` },
          { map: `cueva_${domain}` },
          { map: `torre_${domain}` }
        ] 
      });
      console.log(`Reubicando ${npcs.length} NPCs en el dominio de ${domain}...`);

      let idx = 0;
      for (const npc of npcs) {
        // Distribute: 15 in open map, 10 in cave, 10 in tower
        let targetMap = `mapa_${domain}`;
        let mw = 100, mh = 100;
        
        if (domain === 'espanol') {
          if (idx >= 15 && idx < 25) { targetMap = `cueva_${domain}`; mw = 30; mh = 30; }
          else if (idx >= 25) { targetMap = `torre_${domain}`; mw = 30; mh = 30; }
        }
        
        npc.map = targetMap;
        const grid = getMapGrid(targetMap, mw, mh);
        
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 2000) {
          const rx = Math.floor(Math.random() * (mw - 4)) + 2;
          const ry = Math.floor(Math.random() * (mh - 4)) + 2;
          
          if (!targetMap.startsWith('cueva_') && !targetMap.startsWith('torre_')) {
            const cx = mw / 2; const cy = mh / 2;
            if (rx >= cx - 9 && rx <= cx + 9 && ry >= cy - 9 && ry <= cy + 9) {
              attempts++; continue;
            }
          }

          if (grid[ry] && grid[ry][rx] !== undefined && !SOLID_TILES.includes(grid[ry][rx])) {
            npc.x = rx;
            npc.y = ry;
            await npc.save();
            placed = true;
          }
          attempts++;
        }
        if (!placed) console.warn(`Could not place NPC ${npc.name} in ${targetMap}`);
        idx++;
      }
    }
    console.log('¡NPCs redistribuidos con éxito!');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
run();
