export const NORD = 0b0001;
export const SUD = 0b0010;
export const EST = 0b0100;
export const OUEST = 0b1000;

export const OPPOSITE = {
  [NORD]: SUD,
  [SUD]: NORD,
  [EST]: OUEST,
  [OUEST]: EST,
};

export const DELTA = {
  [NORD]: { dr: -1, dc: 0 },
  [SUD]: { dr: 1, dc: 0 },
  [EST]: { dr: 0, dc: 1 },
  [OUEST]: { dr: 0, dc: -1 },
};

export const DIRECTIONS = [NORD, SUD, EST, OUEST];

export class Maze {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.grid = new Uint8Array(rows * cols);
    this.entry = { row: 0, col: 0 };
    this.exit = { row: rows - 1, col: cols - 1 };
  }

  index(row, col) {
    return row * this.cols + col;
  }

  inBounds(row, col) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  getCell(row, col) {
    return this.grid[this.index(row, col)];
  }

  openWall(row, col, direction) {
    this.grid[this.index(row, col)] |= direction;
  }

  canMove(row, col, direction) {
    return (this.getCell(row, col) & direction) !== 0;
  }

  // Casse les 4 murs autour d'une cellule (sauf les bordures externes)
  breakWalls(row, col) {
    const directions = [NORD, SUD, EST, OUEST];
    for (const dir of directions) {
      const { dr, dc } = DELTA[dir];
      const nr = row + dr;
      const nc = col + dc;
      // Ne casser que si le voisin existe (pas un mur externe)
      if (this.inBounds(nr, nc)) {
        this.openWall(row, col, dir);
        this.openWall(nr, nc, OPPOSITE[dir]);
      }
    }
  }
}
