import { Maze, DIRECTIONS, OPPOSITE, DELTA } from './Maze.js';
import { mulberry32, shuffle } from '../utils/MathUtils.js';

export class MazeGenerator {
  static generate(cols, rows, seed) {
    const maze = new Maze(cols, rows);
    const rng = mulberry32(seed);
    const visited = new Uint8Array(rows * cols);
    const stack = [];

    const startRow = 0;
    const startCol = 0;
    visited[maze.index(startRow, startCol)] = 1;
    stack.push({ row: startRow, col: startCol });

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = [];

      for (const dir of DIRECTIONS) {
        const { dr, dc } = DELTA[dir];
        const nr = current.row + dr;
        const nc = current.col + dc;
        if (maze.inBounds(nr, nc) && !visited[maze.index(nr, nc)]) {
          neighbors.push({ row: nr, col: nc, dir });
        }
      }

      if (neighbors.length > 0) {
        shuffle(neighbors, rng);
        const next = neighbors[0];
        maze.openWall(current.row, current.col, next.dir);
        maze.openWall(next.row, next.col, OPPOSITE[next.dir]);
        visited[maze.index(next.row, next.col)] = 1;
        stack.push({ row: next.row, col: next.col });
      } else {
        stack.pop();
      }
    }

    return maze;
  }
}
