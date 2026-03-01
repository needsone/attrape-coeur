import { lerp } from '../utils/MathUtils.js';
import { NORD, SUD, EST, OUEST } from '../maze/Maze.js';

export class PlayerRenderer {
  constructor() {
    this.fireTimer = 0; // temps restant d'animation feu (ms)
    this.fireDuration = 600;
  }

  triggerFire() {
    this.fireTimer = this.fireDuration;
  }

  update(dt) {
    if (this.fireTimer > 0) {
      this.fireTimer -= dt;
      if (this.fireTimer < 0) this.fireTimer = 0;
    }
  }

  draw(ctx, player, cellSize, offsetX, offsetY, alpha) {
    const x = lerp(player.prevCol, player.col, alpha) * cellSize + cellSize / 2 + offsetX;
    const y = lerp(player.prevRow, player.row, alpha) * cellSize + cellSize / 2 + offsetY;
    const s = cellSize * 0.4;

    // Direction du dragon
    const facing = player.facing || EST;

    ctx.save();
    ctx.translate(x, y);

    // Retourner le dragon selon la direction
    const flipX = (facing === OUEST) ? -1 : 1;
    const rotation = (facing === NORD) ? -Math.PI / 2
      : (facing === SUD) ? Math.PI / 2 : 0;
    ctx.scale(flipX, 1);
    ctx.rotate(rotation);

    // Feu (si actif)
    if (this.fireTimer > 0) {
      this._drawFire(ctx, s);
    }

    // Corps du dragon
    this._drawDragon(ctx, s);

    ctx.restore();
  }

  _drawDragon(ctx, s) {
    // Corps ovale
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.5, s * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ventre
    ctx.fillStyle = '#81C784';
    ctx.beginPath();
    ctx.ellipse(s * 0.05, s * 0.05, s * 0.3, s * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tête
    ctx.fillStyle = '#388E3C';
    ctx.beginPath();
    ctx.ellipse(s * 0.45, -s * 0.05, s * 0.22, s * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Oeil
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(s * 0.5, -s * 0.12, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(s * 0.52, -s * 0.12, s * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // Narines
    ctx.fillStyle = '#2E7D32';
    ctx.beginPath();
    ctx.arc(s * 0.62, -s * 0.02, s * 0.025, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.62, s * 0.04, s * 0.025, 0, Math.PI * 2);
    ctx.fill();

    // Petites cornes
    ctx.fillStyle = '#FF8F00';
    ctx.beginPath();
    ctx.moveTo(s * 0.35, -s * 0.22);
    ctx.lineTo(s * 0.3, -s * 0.38);
    ctx.lineTo(s * 0.42, -s * 0.25);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.48, -s * 0.2);
    ctx.lineTo(s * 0.47, -s * 0.36);
    ctx.lineTo(s * 0.55, -s * 0.22);
    ctx.fill();

    // Ailes
    ctx.fillStyle = 'rgba(76, 175, 80, 0.6)';
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.15);
    ctx.quadraticCurveTo(-s * 0.15, -s * 0.5, s * 0.15, -s * 0.45);
    ctx.quadraticCurveTo(s * 0.1, -s * 0.2, -s * 0.1, -s * 0.15);
    ctx.fill();

    // Queue
    ctx.strokeStyle = '#388E3C';
    ctx.lineWidth = s * 0.08;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 0.45, s * 0.05);
    ctx.quadraticCurveTo(-s * 0.65, -s * 0.15, -s * 0.55, -s * 0.3);
    ctx.stroke();

    // Pointe de la queue
    ctx.fillStyle = '#FF8F00';
    ctx.beginPath();
    ctx.moveTo(-s * 0.55, -s * 0.3);
    ctx.lineTo(-s * 0.65, -s * 0.38);
    ctx.lineTo(-s * 0.48, -s * 0.35);
    ctx.fill();

    // Pattes
    ctx.fillStyle = '#388E3C';
    ctx.fillRect(-s * 0.15, s * 0.25, s * 0.08, s * 0.12);
    ctx.fillRect(s * 0.1, s * 0.25, s * 0.08, s * 0.12);
  }

  _drawFire(ctx, s) {
    const progress = this.fireTimer / this.fireDuration;
    const flicker = Math.sin(Date.now() * 0.03) * 0.2;

    ctx.globalAlpha = progress;

    // Flamme extérieure (rouge-orange)
    const fireLen = s * (0.6 + flicker) * progress;
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.moveTo(s * 0.6, -s * 0.08);
    ctx.quadraticCurveTo(s * 0.6 + fireLen * 0.5, -s * 0.2 + flicker * s * 0.3, s * 0.6 + fireLen, 0);
    ctx.quadraticCurveTo(s * 0.6 + fireLen * 0.5, s * 0.2 - flicker * s * 0.3, s * 0.6, s * 0.08);
    ctx.fill();

    // Flamme intérieure (jaune)
    const innerLen = fireLen * 0.65;
    ctx.fillStyle = '#FFC107';
    ctx.beginPath();
    ctx.moveTo(s * 0.6, -s * 0.04);
    ctx.quadraticCurveTo(s * 0.6 + innerLen * 0.5, -s * 0.1, s * 0.6 + innerLen, 0);
    ctx.quadraticCurveTo(s * 0.6 + innerLen * 0.5, s * 0.1, s * 0.6, s * 0.04);
    ctx.fill();

    // Coeur blanc au centre (flamme)
    const coreLen = fireLen * 0.3;
    ctx.fillStyle = '#FFECB3';
    ctx.beginPath();
    ctx.moveTo(s * 0.6, -s * 0.02);
    ctx.quadraticCurveTo(s * 0.6 + coreLen * 0.5, -s * 0.04, s * 0.6 + coreLen, 0);
    ctx.quadraticCurveTo(s * 0.6 + coreLen * 0.5, s * 0.04, s * 0.6, s * 0.02);
    ctx.fill();

    // Particules de feu
    for (let i = 0; i < 3; i++) {
      const px = s * 0.6 + fireLen * (0.3 + i * 0.2);
      const py = Math.sin(Date.now() * 0.02 + i * 2) * s * 0.15;
      const pr = s * 0.03 * progress;
      ctx.fillStyle = i === 0 ? '#FF9800' : '#FF5722';
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }
}
