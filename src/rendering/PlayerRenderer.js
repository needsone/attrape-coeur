import { lerp } from '../utils/MathUtils.js';
import { NORD, SUD, EST, OUEST } from '../maze/Maze.js';

export class PlayerRenderer {
  constructor() {
    this.fireTimer = 0;
    this.fireDuration = 600;
    this.characterId = 'dragon';
  }

  setCharacter(characterId) {
    this.characterId = characterId;
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

    const facing = player.facing || EST;

    ctx.save();
    ctx.translate(x, y);

    const flipX = (facing === OUEST) ? -1 : 1;
    const rotation = (facing === NORD) ? -Math.PI / 2
      : (facing === SUD) ? Math.PI / 2 : 0;
    ctx.scale(flipX, 1);
    ctx.rotate(rotation);

    // Effet spécial quand on collecte un coeur
    if (this.fireTimer > 0) {
      this._drawEffect(ctx, s);
    }

    // Dessiner le personnage selon le type
    switch (this.characterId) {
      case 'joker': this._drawJoker(ctx, s); break;
      case 'squirrel': this._drawSquirrel(ctx, s); break;
      default: this._drawDragon(ctx, s); break;
    }

    ctx.restore();
  }

  _drawEffect(ctx, s) {
    const progress = this.fireTimer / this.fireDuration;
    ctx.globalAlpha = progress;

    switch (this.characterId) {
      case 'joker': this._drawConfetti(ctx, s, progress); break;
      case 'squirrel': this._drawLeaves(ctx, s, progress); break;
      default: this._drawFire(ctx, s); break;
    }

    ctx.globalAlpha = 1;
  }

  // === DRAGON TSUNAMI (bleu, des royaumes de feu) ===
  _drawDragon(ctx, s) {
    // Corps ovale - bleu profond
    ctx.fillStyle = '#1565C0';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.5, s * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ventre
    ctx.fillStyle = '#42A5F5';
    ctx.beginPath();
    ctx.ellipse(s * 0.05, s * 0.05, s * 0.3, s * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tête
    ctx.fillStyle = '#0D47A1';
    ctx.beginPath();
    ctx.ellipse(s * 0.45, -s * 0.05, s * 0.22, s * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Oeil
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(s * 0.5, -s * 0.12, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FF6F00';
    ctx.beginPath();
    ctx.arc(s * 0.52, -s * 0.12, s * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // Narines
    ctx.fillStyle = '#0D47A1';
    ctx.beginPath();
    ctx.arc(s * 0.62, -s * 0.02, s * 0.025, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.62, s * 0.04, s * 0.025, 0, Math.PI * 2);
    ctx.fill();

    // Cornes de feu (rouge-orange)
    ctx.fillStyle = '#FF3D00';
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

    // Ailes avec effet vague
    ctx.fillStyle = 'rgba(21, 101, 192, 0.6)';
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.15);
    ctx.quadraticCurveTo(-s * 0.15, -s * 0.5, s * 0.15, -s * 0.45);
    ctx.quadraticCurveTo(s * 0.1, -s * 0.2, -s * 0.1, -s * 0.15);
    ctx.fill();

    // Queue avec écailles
    ctx.strokeStyle = '#0D47A1';
    ctx.lineWidth = s * 0.08;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 0.45, s * 0.05);
    ctx.quadraticCurveTo(-s * 0.65, -s * 0.15, -s * 0.55, -s * 0.3);
    ctx.stroke();

    // Pointe de la queue (flamme)
    ctx.fillStyle = '#FF3D00';
    ctx.beginPath();
    ctx.moveTo(-s * 0.55, -s * 0.3);
    ctx.lineTo(-s * 0.65, -s * 0.38);
    ctx.lineTo(-s * 0.48, -s * 0.35);
    ctx.fill();

    // Pattes
    ctx.fillStyle = '#0D47A1';
    ctx.fillRect(-s * 0.15, s * 0.25, s * 0.08, s * 0.12);
    ctx.fillRect(s * 0.1, s * 0.25, s * 0.08, s * 0.12);

    // Petites vagues décoratives sur le corps
    ctx.strokeStyle = '#64B5F6';
    ctx.lineWidth = s * 0.03;
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, 0);
    ctx.quadraticCurveTo(-s * 0.1, -s * 0.08, 0, 0);
    ctx.quadraticCurveTo(s * 0.1, s * 0.08, s * 0.2, 0);
    ctx.stroke();
  }

  _drawFire(ctx, s) {
    const progress = this.fireTimer / this.fireDuration;
    const flicker = Math.sin(Date.now() * 0.03) * 0.2;

    // Flamme extérieure (bleue pour le tsunami)
    const fireLen = s * (0.6 + flicker) * progress;
    ctx.fillStyle = '#2196F3';
    ctx.beginPath();
    ctx.moveTo(s * 0.6, -s * 0.08);
    ctx.quadraticCurveTo(s * 0.6 + fireLen * 0.5, -s * 0.2 + flicker * s * 0.3, s * 0.6 + fireLen, 0);
    ctx.quadraticCurveTo(s * 0.6 + fireLen * 0.5, s * 0.2 - flicker * s * 0.3, s * 0.6, s * 0.08);
    ctx.fill();

    // Flamme intérieure
    const innerLen = fireLen * 0.65;
    ctx.fillStyle = '#90CAF9';
    ctx.beginPath();
    ctx.moveTo(s * 0.6, -s * 0.04);
    ctx.quadraticCurveTo(s * 0.6 + innerLen * 0.5, -s * 0.1, s * 0.6 + innerLen, 0);
    ctx.quadraticCurveTo(s * 0.6 + innerLen * 0.5, s * 0.1, s * 0.6, s * 0.04);
    ctx.fill();

    // Noyau
    const coreLen = fireLen * 0.3;
    ctx.fillStyle = '#E3F2FD';
    ctx.beginPath();
    ctx.moveTo(s * 0.6, -s * 0.02);
    ctx.quadraticCurveTo(s * 0.6 + coreLen * 0.5, -s * 0.04, s * 0.6 + coreLen, 0);
    ctx.quadraticCurveTo(s * 0.6 + coreLen * 0.5, s * 0.04, s * 0.6, s * 0.02);
    ctx.fill();

    // Particules
    for (let i = 0; i < 3; i++) {
      const px = s * 0.6 + fireLen * (0.3 + i * 0.2);
      const py = Math.sin(Date.now() * 0.02 + i * 2) * s * 0.15;
      const pr = s * 0.03 * progress;
      ctx.fillStyle = i === 0 ? '#42A5F5' : '#1E88E5';
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === JOKER ===
  _drawJoker(ctx, s) {
    // Corps
    ctx.fillStyle = '#7B1FA2';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.45, s * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Col en losanges
    ctx.fillStyle = '#FFD600';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(s * 0.1 + i * s * 0.15, -s * 0.3);
      ctx.lineTo(s * 0.1 + i * s * 0.15 + s * 0.06, -s * 0.22);
      ctx.lineTo(s * 0.1 + i * s * 0.15, -s * 0.14);
      ctx.lineTo(s * 0.1 + i * s * 0.15 - s * 0.06, -s * 0.22);
      ctx.closePath();
      ctx.fill();
    }

    // Tête
    ctx.fillStyle = '#F5F5DC';
    ctx.beginPath();
    ctx.arc(s * 0.35, -s * 0.05, s * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Chapeau du bouffon (3 pointes)
    ctx.fillStyle = '#E91E63';
    ctx.beginPath();
    ctx.moveTo(s * 0.15, -s * 0.22);
    ctx.quadraticCurveTo(s * 0.1, -s * 0.55, s * 0.0, -s * 0.45);
    ctx.lineTo(s * 0.25, -s * 0.25);
    ctx.fill();

    ctx.fillStyle = '#7B1FA2';
    ctx.beginPath();
    ctx.moveTo(s * 0.25, -s * 0.25);
    ctx.quadraticCurveTo(s * 0.35, -s * 0.6, s * 0.45, -s * 0.45);
    ctx.lineTo(s * 0.45, -s * 0.22);
    ctx.fill();

    ctx.fillStyle = '#00BCD4';
    ctx.beginPath();
    ctx.moveTo(s * 0.45, -s * 0.22);
    ctx.quadraticCurveTo(s * 0.6, -s * 0.5, s * 0.65, -s * 0.35);
    ctx.lineTo(s * 0.55, -s * 0.18);
    ctx.fill();

    // Grelots au bout des pointes
    ctx.fillStyle = '#FFD600';
    ctx.beginPath();
    ctx.arc(s * 0.0, -s * 0.45, s * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.45, -s * 0.45, s * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.65, -s * 0.35, s * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // Yeux (un qui rit, asymétriques)
    ctx.fillStyle = '#000';
    // Oeil gauche (rond)
    ctx.beginPath();
    ctx.arc(s * 0.3, -s * 0.1, s * 0.04, 0, Math.PI * 2);
    ctx.fill();
    // Oeil droit (clin d'oeil)
    ctx.strokeStyle = '#000';
    ctx.lineWidth = s * 0.03;
    ctx.beginPath();
    ctx.arc(s * 0.42, -s * 0.1, s * 0.04, 0, Math.PI);
    ctx.stroke();

    // Sourire
    ctx.strokeStyle = '#E91E63';
    ctx.lineWidth = s * 0.04;
    ctx.beginPath();
    ctx.arc(s * 0.35, s * 0.0, s * 0.1, 0.1, Math.PI - 0.1);
    ctx.stroke();

    // Nez rouge
    ctx.fillStyle = '#FF1744';
    ctx.beginPath();
    ctx.arc(s * 0.45, -s * 0.02, s * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // Bras/manches
    ctx.fillStyle = '#E91E63';
    ctx.fillRect(-s * 0.15, s * 0.2, s * 0.1, s * 0.15);
    ctx.fillStyle = '#00BCD4';
    ctx.fillRect(s * 0.1, s * 0.2, s * 0.1, s * 0.15);

    // Chaussures pointues
    ctx.fillStyle = '#7B1FA2';
    ctx.beginPath();
    ctx.moveTo(-s * 0.18, s * 0.35);
    ctx.lineTo(-s * 0.3, s * 0.32);
    ctx.lineTo(-s * 0.08, s * 0.35);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.08, s * 0.35);
    ctx.lineTo(s * 0.25, s * 0.32);
    ctx.lineTo(s * 0.2, s * 0.35);
    ctx.fill();
  }

  _drawConfetti(ctx, s, progress) {
    const colors = ['#E91E63', '#FFD600', '#00BCD4', '#7B1FA2', '#FF5722'];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + Date.now() * 0.003;
      const dist = s * (0.6 + (1 - progress) * 0.8);
      const px = Math.cos(angle) * dist;
      const py = Math.sin(angle) * dist;
      ctx.fillStyle = colors[i % colors.length];
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle + Date.now() * 0.01);
      ctx.fillRect(-s * 0.04, -s * 0.02, s * 0.08, s * 0.04);
      ctx.restore();
    }
  }

  // === ÉCUREUIL ===
  _drawSquirrel(ctx, s) {
    // Grande queue touffue
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, s * 0.1);
    ctx.quadraticCurveTo(-s * 0.7, -s * 0.1, -s * 0.55, -s * 0.5);
    ctx.quadraticCurveTo(-s * 0.3, -s * 0.65, -s * 0.15, -s * 0.4);
    ctx.quadraticCurveTo(-s * 0.1, -s * 0.2, -s * 0.2, s * 0.05);
    ctx.fill();

    // Bout de queue plus clair
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.quadraticCurveTo(-s * 0.5, -s * 0.55, -s * 0.4, -s * 0.5);
    ctx.quadraticCurveTo(-s * 0.25, -s * 0.55, -s * 0.2, -s * 0.35);
    ctx.fill();

    // Corps
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.4, s * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ventre blanc
    ctx.fillStyle = '#FFECD2';
    ctx.beginPath();
    ctx.ellipse(s * 0.05, s * 0.05, s * 0.25, s * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tête
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.arc(s * 0.38, -s * 0.02, s * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Joues
    ctx.fillStyle = '#FFECD2';
    ctx.beginPath();
    ctx.arc(s * 0.42, s * 0.08, s * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Oreilles
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(s * 0.3, -s * 0.25, s * 0.06, s * 0.1, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s * 0.45, -s * 0.23, s * 0.06, s * 0.1, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Intérieur des oreilles
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.ellipse(s * 0.3, -s * 0.24, s * 0.03, s * 0.06, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s * 0.45, -s * 0.22, s * 0.03, s * 0.06, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Yeux
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(s * 0.33, -s * 0.08, s * 0.045, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.45, -s * 0.08, s * 0.045, 0, Math.PI * 2);
    ctx.fill();

    // Reflets dans les yeux
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(s * 0.34, -s * 0.1, s * 0.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.46, -s * 0.1, s * 0.02, 0, Math.PI * 2);
    ctx.fill();

    // Nez
    ctx.fillStyle = '#FF6B9D';
    ctx.beginPath();
    ctx.arc(s * 0.52, s * 0.0, s * 0.035, 0, Math.PI * 2);
    ctx.fill();

    // Moustaches
    ctx.strokeStyle = '#666';
    ctx.lineWidth = s * 0.015;
    ctx.beginPath();
    ctx.moveTo(s * 0.55, -s * 0.02);
    ctx.lineTo(s * 0.72, -s * 0.08);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s * 0.55, s * 0.02);
    ctx.lineTo(s * 0.72, s * 0.06);
    ctx.stroke();

    // Petites pattes avant
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(s * 0.05, s * 0.25, s * 0.07, s * 0.12);
    ctx.fillRect(s * 0.18, s * 0.25, s * 0.07, s * 0.12);

    // Pattes arrière
    ctx.fillRect(-s * 0.2, s * 0.22, s * 0.1, s * 0.14);
  }

  _drawLeaves(ctx, s, progress) {
    const colors = ['#4CAF50', '#8BC34A', '#FF9800', '#F44336', '#FFEB3B'];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Date.now() * 0.002;
      const dist = s * (0.5 + (1 - progress) * 1.0);
      const px = Math.cos(angle) * dist;
      const py = Math.sin(angle) * dist;
      ctx.fillStyle = colors[i % colors.length];
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle + Date.now() * 0.008);
      // Forme de feuille
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.06, s * 0.03, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
