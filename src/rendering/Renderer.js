import { CanvasScaler } from '../utils/CanvasScaler.js';
import { MazeRenderer } from './MazeRenderer.js';
import { PlayerRenderer } from './PlayerRenderer.js';
import { UIRenderer } from './UIRenderer.js';

const HUD_HEIGHT = 50;

export class Renderer {
  constructor() {
    this.bgCanvas = document.getElementById('layer-bg');
    this.dynCanvas = document.getElementById('layer-dynamic');
    this.uiCanvas = document.getElementById('layer-ui');
    this.mazeRenderer = new MazeRenderer();
    this.playerRenderer = new PlayerRenderer();
    this.uiRenderer = new UIRenderer();
    this.width = 0;
    this.height = 0;
    this.cellSize = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  resize() {
    const { width, height } = CanvasScaler.computeGameArea();
    this.width = width;
    this.height = height;

    this.bgCtx = CanvasScaler.setup(this.bgCanvas, width, height);
    this.dynCtx = CanvasScaler.setup(this.dynCanvas, width, height);
    this.uiCtx = CanvasScaler.setup(this.uiCanvas, width, height);

    const container = document.getElementById('game-container');
    container.style.width = width + 'px';
    container.style.height = height + 'px';
  }

  computeLayout(maze) {
    const availW = this.width - 20;
    const availH = this.height - HUD_HEIGHT - 20;
    const cellW = Math.floor(availW / maze.cols);
    const cellH = Math.floor(availH / maze.rows);
    this.cellSize = Math.min(cellW, cellH);
    this.offsetX = Math.floor((this.width - maze.cols * this.cellSize) / 2);
    this.offsetY = HUD_HEIGHT + Math.floor((this.height - HUD_HEIGHT - maze.rows * this.cellSize) / 2);
  }

  drawStatic(maze) {
    this.bgCtx.clearRect(0, 0, this.width, this.height);
    this.mazeRenderer.draw(this.bgCtx, maze, this.cellSize, this.offsetX, this.offsetY);
  }

  drawDynamic(player, hearts, alpha) {
    this.dynCtx.clearRect(0, 0, this.width, this.height);

    // Coeurs non collectés
    for (const heart of hearts) {
      if (heart.collected) continue;
      this.drawHeart(heart);
    }

    this.playerRenderer.draw(this.dynCtx, player, this.cellSize, this.offsetX, this.offsetY, alpha);
  }

  drawHeart(heart) {
    const cx = this.offsetX + heart.col * this.cellSize + this.cellSize / 2;
    const cy = this.offsetY + heart.row * this.cellSize + this.cellSize / 2;
    const r = this.cellSize * 0.2;
    const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.15;

    this.dynCtx.save();
    this.dynCtx.translate(cx, cy);
    this.dynCtx.scale(pulse, pulse);
    this.dynCtx.fillStyle = '#FF1744';
    this.dynCtx.font = `${r * 2.5}px serif`;
    this.dynCtx.textAlign = 'center';
    this.dynCtx.textBaseline = 'middle';
    this.dynCtx.fillText('♥', 0, 0);
    this.dynCtx.restore();
  }

  drawUI(state) {
    this.uiRenderer.draw(this.uiCtx, this.width, this.height, state);
  }

  // Dessine un écran overlay (menu, résultat, game over)
  drawOverlay(drawFn) {
    this.dynCtx.clearRect(0, 0, this.width, this.height);
    this.bgCtx.clearRect(0, 0, this.width, this.height);
    this.uiCtx.clearRect(0, 0, this.width, this.height);
    drawFn(this.uiCtx, this.width, this.height);
  }
}
