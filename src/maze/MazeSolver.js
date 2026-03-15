import { DIRECTIONS, DELTA } from './Maze.js';

export class MazeSolver {
  // BFS : retourne le chemin le plus court entre entry et exit
  static findPath(maze) {
    const { rows, cols, entry, exit } = maze;
    const prev = new Int32Array(rows * cols).fill(-1);
    const visited = new Uint8Array(rows * cols);
    const queue = [entry];
    visited[maze.index(entry.row, entry.col)] = 1;

    while (queue.length > 0) {
      const { row, col } = queue.shift();
      if (row === exit.row && col === exit.col) break;

      for (const dir of DIRECTIONS) {
        if (!maze.canMove(row, col, dir)) continue;
        const { dr, dc } = DELTA[dir];
        const nr = row + dr;
        const nc = col + dc;
        const ni = maze.index(nr, nc);
        if (!visited[ni]) {
          visited[ni] = 1;
          prev[ni] = maze.index(row, col);
          queue.push({ row: nr, col: nc });
        }
      }
    }

    // Reconstruire le chemin
    const path = new Set();
    let idx = maze.index(exit.row, exit.col);
    while (idx !== -1) {
      path.add(idx);
      idx = prev[idx];
    }
    return path;
  }

  // Trouve les impasses les plus éloignées du chemin principal
  static placeHearts(maze, count) {
    const path = this.findPath(maze);
    const { rows, cols } = maze;
    const deadEnds = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = maze.index(r, c);
        if (path.has(idx)) continue;

        // Compter les passages ouverts
        let openCount = 0;
        for (const dir of DIRECTIONS) {
          if (maze.canMove(r, c, dir)) openCount++;
        }
        if (openCount === 1) {
          // Calculer distance minimum au chemin principal (Manhattan)
          let minDist = Infinity;
          for (const pi of path) {
            const pr = Math.floor(pi / cols);
            const pc = pi % cols;
            const dist = Math.abs(r - pr) + Math.abs(c - pc);
            if (dist < minDist) minDist = dist;
          }
          deadEnds.push({ row: r, col: c, dist: minDist });
        }
      }
    }

    // Trier par distance décroissante
    deadEnds.sort((a, b) => b.dist - a.dist);

    // Si pas assez d'impasses, placer aussi sur des cellules hors chemin
    if (deadEnds.length < count) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = maze.index(r, c);
          if (path.has(idx)) continue;
          if (deadEnds.some(d => d.row === r && d.col === c)) continue;
          if (r === maze.entry.row && c === maze.entry.col) continue;
          if (r === maze.exit.row && c === maze.exit.col) continue;
          deadEnds.push({ row: r, col: c, dist: 0 });
          if (deadEnds.length >= count) break;
        }
        if (deadEnds.length >= count) break;
      }
    }

    return deadEnds.slice(0, count).map(({ row, col }) => ({ row, col }));
  }

  // Place la bombe sur une cellule stratégique : pas sur le chemin, pas sur l'entrée/sortie, pas sur un coeur
  static placeBomb(maze, heartPositions) {
    const path = this.findPath(maze);
    const { rows, cols } = maze;
    const heartSet = new Set(heartPositions.map(h => maze.index(h.row, h.col)));
    const entryIdx = maze.index(maze.entry.row, maze.entry.col);
    const exitIdx = maze.index(maze.exit.row, maze.exit.col);

    // Chercher une cellule qui a le plus de murs (pour maximiser l'utilité de la bombe)
    let best = null;
    let bestWalls = -1;

    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        const idx = maze.index(r, c);
        if (path.has(idx)) continue;
        if (heartSet.has(idx)) continue;
        if (idx === entryIdx || idx === exitIdx) continue;

        // Compter les murs fermés internes
        let wallCount = 0;
        for (const dir of DIRECTIONS) {
          if (!maze.canMove(r, c, dir)) {
            const { dr, dc } = DELTA[dir];
            if (maze.inBounds(r + dr, c + dc)) wallCount++;
          }
        }

        if (wallCount > bestWalls) {
          bestWalls = wallCount;
          best = { row: r, col: c };
        }
      }
    }

    // Fallback : si rien trouvé, placer au centre
    if (!best) {
      best = { row: Math.floor(rows / 2), col: Math.floor(cols / 2) };
    }

    return best;
  }
}
