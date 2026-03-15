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

  drawDynamic(player, hearts, bomb, alpha, explosionTime, now) {
    this.dynCtx.clearRect(0, 0, this.width, this.height);

    // Coeurs non collectés
    for (const heart of hearts) {
      if (heart.collected) continue;
      this.drawHeart(heart);
    }

    // Bombe posée et non explosée
    if (bomb && bomb.placed && !bomb.exploded) {
      this.drawBomb(bomb, now);
    }

    // Flash d'explosion
    if (explosionTime && bomb && (now - explosionTime) < 500) {
      const flashAlpha = 1 - (now - explosionTime) / 500;
      this.drawExplosion(bomb.row, bomb.col, flashAlpha);
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

  drawBomb(bomb, now) {
    const cx = this.offsetX + bomb.col * this.cellSize + this.cellSize / 2;
    const cy = this.offsetY + bomb.row * this.cellSize + this.cellSize / 2;
    const s = this.cellSize * 0.35;
    const countdown = bomb.countdown(now);
    const critical = countdown < 0.7;

    // Pulsation accélérée en fin de compte à rebours
    const pulseSpeed = critical ? 0.04 : 0.004;
    const pulse = 1 + Math.sin(now * pulseSpeed) * (critical ? 0.2 : 0.1);

    this.dynCtx.save();
    this.dynCtx.translate(cx, cy);
    this.dynCtx.scale(pulse, pulse);

    // Corps de la bombe
    this.dynCtx.fillStyle = critical ? '#CC0000' : '#1A1A1A';
    this.dynCtx.beginPath();
    this.dynCtx.arc(0, s * 0.05, s * 0.5, 0, Math.PI * 2);
    this.dynCtx.fill();

    // Reflet
    this.dynCtx.fillStyle = critical ? '#FF4444' : '#444';
    this.dynCtx.beginPath();
    this.dynCtx.arc(-s * 0.12, -s * 0.08, s * 0.15, 0, Math.PI * 2);
    this.dynCtx.fill();

    // Mèche
    this.dynCtx.strokeStyle = '#8D6E63';
    this.dynCtx.lineWidth = s * 0.1;
    this.dynCtx.lineCap = 'round';
    this.dynCtx.beginPath();
    this.dynCtx.moveTo(0, -s * 0.4);
    this.dynCtx.quadraticCurveTo(s * 0.2, -s * 0.6, s * 0.1, -s * 0.75);
    this.dynCtx.stroke();

    // Étincelle
    const flicker = Math.sin(now * (critical ? 0.05 : 0.015)) * 0.3 + 0.7;
    this.dynCtx.fillStyle = `rgba(255, 193, 7, ${flicker})`;
    this.dynCtx.beginPath();
    this.dynCtx.arc(s * 0.1, -s * 0.75, s * 0.12, 0, Math.PI * 2);
    this.dynCtx.fill();
    this.dynCtx.fillStyle = `rgba(255, 87, 34, ${flicker * 0.8})`;
    this.dynCtx.beginPath();
    this.dynCtx.arc(s * 0.1, -s * 0.75, s * 0.08, 0, Math.PI * 2);
    this.dynCtx.fill();

    this.dynCtx.restore();

    // Compte à rebours affiché sous la bombe
    this.dynCtx.save();
    this.dynCtx.fillStyle = critical ? '#FF1744' : '#FFD740';
    this.dynCtx.font = `bold ${this.cellSize * 0.28}px sans-serif`;
    this.dynCtx.textAlign = 'center';
    this.dynCtx.textBaseline = 'middle';
    this.dynCtx.fillText(countdown.toFixed(1), cx, cy + s * 1.0);
    this.dynCtx.restore();
  }

  drawExplosion(row, col, flashAlpha) {
    const cx = this.offsetX + col * this.cellSize + this.cellSize / 2;
    const cy = this.offsetY + row * this.cellSize + this.cellSize / 2;
    const r = this.cellSize * 2.5;

    const gradient = this.dynCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
    gradient.addColorStop(0, `rgba(255, 220, 50, ${flashAlpha})`);
    gradient.addColorStop(0.4, `rgba(255, 100, 0, ${flashAlpha * 0.8})`);
    gradient.addColorStop(1, `rgba(255, 30, 0, 0)`);

    this.dynCtx.save();
    this.dynCtx.fillStyle = gradient;
    this.dynCtx.beginPath();
    this.dynCtx.arc(cx, cy, r, 0, Math.PI * 2);
    this.dynCtx.fill();
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
