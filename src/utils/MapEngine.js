// MapEngine.js
// Genera cuadrículas 2D para renderizar el mundo y detectar colisiones sólidas

export const TILES = {
  GRASS: 0,
  WATER: 1,      // Sólido
  TREE: 2,       // Sólido
  PATH: 3,
  HOUSE: 4,      // Sólido
  WALL: 5,       // Sólido
  FLOOR: 6,
  FLOWER: 7
};

export const SOLID_TILES = [TILES.WATER, TILES.TREE, TILES.HOUSE, TILES.WALL];

const generateNoise = (x, y, seed) => {
  // Función hash súper básica para pseudo-aleatoriedad
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
};

export const generateMap = (mapName, width, height) => {
  const grid = Array(height).fill(0).map(() => Array(width).fill(TILES.GRASS));
  const seed = mapName.length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // 1. Bordes de agua (simulando una isla)
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        // Excepciones para puertas de mapa
        if (mapName === 'pueblo_inicial') {
          if ((x === 0 && y === Math.floor(height/2)) || 
              (x === width - 1 && y === Math.floor(height/2)) || 
              (x === Math.floor(width/2) && y === height - 1) || 
              (x === Math.floor(width/2) && y === 0)) {
            grid[y][x] = TILES.PATH;
            continue;
          }
        }
        grid[y][x] = TILES.WATER;
        continue;
      }

      // 2. Ruido para árboles y flores (Bosques densos en los bordes)
      const distFromCenter = Math.sqrt(Math.pow(x - width/2, 2) + Math.pow(y - height/2, 2));
      const maxDist = width / 2;
      const noise = generateNoise(x, y, seed);

      if (distFromCenter > maxDist * 0.7 && noise > 0.4) {
        grid[y][x] = TILES.TREE;
      } else if (noise > 0.9) {
        grid[y][x] = TILES.TREE;
      } else if (noise > 0.85) {
        grid[y][x] = TILES.FLOWER;
      }
    }
  }

  // 3. Caminos cruzados principales
  const cx = Math.floor(width/2);
  const cy = Math.floor(height/2);

  // Cruz principal de caminos
  for(let i=1; i<width-1; i++) {
    grid[cy][i] = TILES.PATH;
    grid[cy-1][i] = TILES.PATH; // 2 de grosor
  }
  for(let j=1; j<height-1; j++) {
    grid[j][cx] = TILES.PATH;
    grid[j][cx-1] = TILES.PATH;
  }

  // 4. Edificios y estructuras específicas según el mapa
  if (mapName === 'pueblo_inicial') {
    // Casitas decorativas
    const houses = [
      {hx: cx - 10, hy: cy - 10},
      {hx: cx + 10, hy: cy - 10},
      {hx: cx - 10, hy: cy + 10},
      {hx: cx + 10, hy: cy + 10},
    ];
    houses.forEach(h => {
      for(let hyy=0; hyy<3; hyy++) {
        for(let hxx=0; hxx<4; hxx++) {
          grid[h.hy+hyy][h.hx+hxx] = TILES.HOUSE;
        }
      }
      grid[h.hy+3][h.hx+1] = TILES.PATH; // Puerta camino
      grid[h.hy+3][h.hx+2] = TILES.PATH;
    });

  } else {
    // Reinos (Tienen una escuela en el centro 15x15)
    for(let sy=cy-7; sy<=cy+7; sy++) {
      for(let sx=cx-7; sx<=cx+7; sx++) {
        // Muros
        if (sy === cy-7 || sy === cy+7 || sx === cx-7 || sx === cx+7) {
          // Dejar entrada sur y norte libre
          if ((sx === cx || sx === cx-1) && (sy === cy+7 || sy === cy-7)) {
            grid[sy][sx] = TILES.PATH;
          } else {
            grid[sy][sx] = TILES.WALL;
          }
        } else {
          // Piso interior
          grid[sy][sx] = TILES.FLOOR;
        }
      }
    }
  }

  return grid;
};
