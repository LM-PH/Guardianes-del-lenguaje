// MapEngine.js - Genera cuadrículas 2D para el mundo y colisiones

export const TILES = {
  GRASS: 0,
  WATER: 1,   // Sólido
  TREE: 2,    // Sólido
  PATH: 3,
  WALL: 5,
  FLOOR: 6,
  FLOWER: 7,
  HOUSE_DOOR: 8, // Puerta de casa - activa transición
  HOUSE_EXIT: 9, // Salida de la casa
  HOUSE: 10,     // Esquina superior izquierda de la casa
  HOUSE_WALL: 11,// Pared invisible de la casa (dibuja pasto, pero choca)
  CAVE_FLOOR: 12,
  CAVE_WALL: 13, // Sólido
  WOOD_FLOOR: 14,
  BOOKSHELF: 15, // Sólido
};

export const SOLID_TILES = [TILES.WATER, TILES.TREE, TILES.WALL, TILES.HOUSE, TILES.HOUSE_WALL, TILES.CAVE_WALL, TILES.BOOKSHELF];

const noise = (x, y, seed) => {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
};

export const generateMap = (mapName, width, height) => {
  let baseTile = TILES.GRASS;
  let isCave = mapName.startsWith('cueva_');
  let isTower = mapName.startsWith('torre_');
  
  if (isCave) baseTile = TILES.CAVE_FLOOR;
  else if (isTower) baseTile = TILES.WOOD_FLOOR;

  const grid = Array(height).fill(null).map(() => Array(width).fill(baseTile));
  const seed = mapName.length + 7;

  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);

  // 1. Bordes
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        if (mapName === 'pueblo_inicial') {
          if ((x === 0 && y === cy) ||
              (x === width - 1 && y === cy) ||
              (x === cx && y === height - 1) ||
              (x === cx && y === 0)) {
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

  // 2. Obstáculos con ruido
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const maxDist = Math.min(width, height) / 2;
      const n = noise(x, y, seed);

      if (isCave) {
        // Laberinto rocoso con pasillos garantizados para accesibilidad
        if (n > 0.55 && dist > 3 && x % 4 !== 0 && y % 4 !== 0) {
          grid[y][x] = TILES.CAVE_WALL;
        }
      } else if (isTower) {
        // Filas de estanterías o pasillos
        if (x % 4 === 0 && y % 3 !== 0 && dist > 3) {
          grid[y][x] = TILES.BOOKSHELF;
        }
      } else {
        // Zonas de aparición de portales libres de árboles para evitar el bug de teletransporte
        const isPortalSpawn = mapName === 'mapa_espanol' && 
          ((x >= 22 && x <= 28 && y >= 47 && y <= 55) || (x >= 72 && x <= 78 && y >= 47 && y <= 55));
          
        if (isPortalSpawn) {
          continue; // Dejar libre de obstáculos
        }

        // Árboles y flores
        if (dist > maxDist * 0.65 && n > 0.35) {
          grid[y][x] = TILES.TREE;
        } else if (dist > maxDist * 0.3 && n > 0.88) {
          grid[y][x] = TILES.TREE;
        } else if (n > 0.84 && n <= 0.88) {
          grid[y][x] = TILES.FLOWER;
        }
      }
    }
  }

  // 3. Cruz principal de caminos (siempre libre de obstáculos)
  // Camino horizontal: 3 tiles de grosor para asegurar paso
  for (let x = 0; x < width; x++) {
    grid[cy - 1][x] = TILES.PATH;
    grid[cy][x]     = TILES.PATH;
    grid[cy + 1][x] = TILES.PATH;
  }
  // Camino vertical: 3 tiles de grosor
  for (let y = 0; y < height; y++) {
    grid[y][cx - 1] = TILES.PATH;
    grid[y][cx]     = TILES.PATH;
    grid[y][cx + 1] = TILES.PATH;
  }

  // 4. Casas entrables en pueblo_inicial
  if (mapName === 'pueblo_inicial') {
    const housePositions = [
      { hx: cx - 12, hy: cy - 12, id: 'house_0' },
      { hx: cx + 8,  hy: cy - 12, id: 'house_1' },
      { hx: cx - 12, hy: cy + 8,  id: 'house_2' },
      { hx: cx + 8,  hy: cy + 8,  id: 'house_3' },
    ];
    housePositions.forEach(({ hx, hy }) => {
      if (hx < 2 || hy < 2 || hx + 4 >= width - 2 || hy + 4 >= height - 2) return;
      // Paredes de la casa (3 filas de alto x 4 de ancho)
      for (let dy = 0; dy < 3; dy++) {
        for (let dx = 0; dx < 4; dx++) {
          if (dx === 0 && dy === 0) grid[hy + dy][hx + dx] = TILES.HOUSE;
          else grid[hy + dy][hx + dx] = TILES.HOUSE_WALL;
        }
      }
      // Puerta de la casa (HOUSE_DOOR)
      grid[hy + 3][hx + 1] = TILES.HOUSE_DOOR;
      grid[hy + 3][hx + 2] = TILES.HOUSE_DOOR;
      // Camino de la puerta al camino principal
      for (let d = 4; d < Math.abs(cy - hy) + 1; d++) {
        const py = hy + d;
        if (py >= 0 && py < height) {
          grid[py][hx + 1] = TILES.PATH;
          grid[py][hx + 2] = TILES.PATH;
        }
      }
    });
  }

  // 5. Academia central en reinos
  if (mapName !== 'pueblo_inicial' && mapName !== 'interior_casa' && !mapName.startsWith('interior_')) {
    const R = 8; // radio de la academia
    for (let sy = cy - R; sy <= cy + R; sy++) {
      for (let sx = cx - R; sx <= cx + R; sx++) {
        if (sy < 1 || sy >= height - 1 || sx < 1 || sx >= width - 1) continue;
        const isEdge = sy === cy - R || sy === cy + R || sx === cx - R || sx === cx + R;
        if (isEdge) {
          // Puertas norte y sur de la academia
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
    // Camino norte-sur dentro de la academia (conecta las puertas)
    for (let y = cy - R + 1; y < cy + R; y++) {
      grid[y][cx - 1] = TILES.FLOOR;
      grid[y][cx]     = TILES.FLOOR;
      grid[y][cx + 1] = TILES.FLOOR;
    }
  }

  // 6. Interior de casa o gimnasios
  if (mapName === 'interior_casa' || mapName.startsWith('interior_')) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          grid[y][x] = TILES.WALL;
        } else {
          grid[y][x] = TILES.FLOOR; // Piso de madera
        }
      }
    }
    // Puerta de salida
    grid[height - 1][cx] = TILES.HOUSE_EXIT;
    grid[height - 1][cx - 1] = TILES.HOUSE_EXIT;
    grid[height - 2][cx] = TILES.FLOOR;
    grid[height - 2][cx - 1] = TILES.FLOOR;
  }

  return grid;
};
