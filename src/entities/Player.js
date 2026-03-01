import { DELTA, EST } from '../maze/Maze.js';

export class Player {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.prevRow = row;
    this.prevCol = col;
    this.facing = EST;
  }

  moveTo(direction) {
    const { dr, dc } = DELTA[direction];
    this.prevRow = this.row;
    this.prevCol = this.col;
    this.row += dr;
    this.col += dc;
    this.facing = direction;
  }

  snapInterpolation() {
    this.prevRow = this.row;
    this.prevCol = this.col;
  }

  isAt(row, col) {
    return this.row === row && this.col === col;
  }

  reset(row, col) {
    this.row = row;
    this.col = col;
    this.prevRow = row;
    this.prevCol = col;
  }
}
