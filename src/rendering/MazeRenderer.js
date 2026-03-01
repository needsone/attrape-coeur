import { NORD, SUD, EST, OUEST } from '../maze/Maze.js';

export class MazeRenderer {
  draw(ctx, maze, cellSize, offsetX, offsetY) {
    const { rows, cols } = maze;

    // Fond
    ctx.fillStyle = '#0D0620';
    ctx.fillRect(offsetX, offsetY, cols * cellSize, rows * cellSize);

    // Sol des cellules
    ctx.fillStyle = '#1A0A2E';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillRect(
          offsetX + c * cellSize + 1,
          offsetY + r * cellSize + 1,
          cellSize - 2,
          cellSize - 2
        );
      }
    }

    // Murs
    ctx.strokeStyle = '#6B3FA0';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = offsetX + c * cellSize;
        const y = offsetY + r * cellSize;
        const cell = maze.getCell(r, c);

        if (!(cell & NORD)) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + cellSize, y);
          ctx.stroke();
        }
        if (!(cell & OUEST)) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + cellSize);
          ctx.stroke();
        }
      }
    }

    // Bordures droite et bas
    ctx.beginPath();
    ctx.moveTo(offsetX + cols * cellSize, offsetY);
    ctx.lineTo(offsetX + cols * cellSize, offsetY + rows * cellSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + rows * cellSize);
    ctx.lineTo(offsetX + cols * cellSize, offsetY + rows * cellSize);
    ctx.stroke();

    // Entrée (vert)
    this.drawMarker(ctx, offsetX, offsetY, cellSize, maze.entry, '#00E676');
    // Sortie (rouge-rose)
    this.drawMarker(ctx, offsetX, offsetY, cellSize, maze.exit, '#FF6B9D');
  }

  drawMarker(ctx, offsetX, offsetY, cellSize, pos, color) {
    const cx = offsetX + pos.col * cellSize + cellSize / 2;
    const cy = offsetY + pos.row * cellSize + cellSize / 2;
    const r = cellSize * 0.2;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
