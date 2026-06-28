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
};

export const SOLID_TILES = [TILES.WATER, TILES.TREE, TILES.WALL, TILES.HOUSE];

const noise = (x, y, seed) => {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
};

export const generateMap = (mapName, width, height) => {
  const grid = Array(height).fill(null).map(() => Array(width).fill(TILES.GRASS));
  const seed = mapName.length + 7;

  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);

  // 1. Bordes de agua
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        // Dejar puertas de mapa abiertas en pueblo_inicial
        if (mapName === 'pueblo_inicial') {
          if ((x === 0 && y === cy) ||
              (x === width - 1 && y === cy) ||
              (x === cx && y === height - 1) ||
              (x === cx && y === 0)) {
            grid[y][x] = TILES.PATH;
            continue;
          }
        }
        grid[y][x] = TILES.WATER;
      }
    }
  }

  // 2. Árboles y flores con ruido - solo lejos del centro
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const maxDist = Math.min(width, height) / 2;
      const n = noise(x, y, seed);

      if (dist > maxDist * 0.65 && n > 0.35) {
        grid[y][x] = TILES.TREE;
      } else if (dist > maxDist * 0.3 && n > 0.88) {
        grid[y][x] = TILES.TREE;
      } else if (n > 0.84 && n <= 0.88) {
        grid[y][x] = TILES.FLOWER;
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
          else grid[hy + dy][hx + dx] = TILES.WALL;
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
  if (mapName !== 'pueblo_inicial') {
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

  // 6. Interior de casa
  if (mapName === 'interior_casa') {
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
