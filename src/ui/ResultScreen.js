export class ResultScreen {
  constructor() {
    this._onClick = null;
    this._onKey = null;
  }

  draw(ctx, width, height, data) {
    ctx.fillStyle = '#1A0A2E';
    ctx.fillRect(0, 0, width, height);

    const titleSize = Math.min(40, width * 0.07);
    ctx.font = `bold ${titleSize}px 'Segoe UI', system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (data.success) {
      ctx.fillStyle = '#00E676';
      ctx.fillText('Niveau terminé !', width / 2, height * 0.2);
    } else if (data.timeout) {
      ctx.fillStyle = '#FF5252';
      ctx.fillText('Temps écoulé !', width / 2, height * 0.2);
    } else {
      ctx.fillStyle = '#FFD740';
      ctx.fillText('Coeurs manquants !', width / 2, height * 0.2);
    }

    const infoSize = Math.min(22, width * 0.04);
    ctx.font = `${infoSize}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillStyle = '#F0E6FF';

    const time = data.timeUsed || 0;
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    ctx.fillText(`Niveau : ${data.level}`, width / 2, height * 0.35);
    ctx.fillText(`Temps : ${minutes}:${seconds.toString().padStart(2, '0')}`, width / 2, height * 0.43);
    ctx.fillText(`Coeurs : ${data.heartsCollected} / ${data.heartsTotal}`, width / 2, height * 0.51);

    // Boutons
    const btnW = Math.min(200, width * 0.35);
    const btnH = 45;
    const btnY = height * 0.68;

    this._menuBtn = { x: width / 2 - btnW - 10, y: btnY, w: btnW, h: btnH };
    this._retryBtn = { x: width / 2 + 10, y: btnY, w: btnW, h: btnH };

    // Menu
    ctx.fillStyle = '#311B92';
    ctx.beginPath();
    ctx.roundRect(this._menuBtn.x, this._menuBtn.y, btnW, btnH, 8);
    ctx.fill();
    ctx.fillStyle = '#F0E6FF';
    ctx.font = `bold ${infoSize}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillText('Menu', this._menuBtn.x + btnW / 2, btnY + btnH / 2);

    // Rejouer / Suivant
    ctx.fillStyle = data.success ? '#00C853' : '#7C4DFF';
    ctx.beginPath();
    ctx.roundRect(this._retryBtn.x, this._retryBtn.y, btnW, btnH, 8);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.fillText(data.success ? 'Suivant' : 'Rejouer', this._retryBtn.x + btnW / 2, btnY + btnH / 2);
  }

  enableInput(canvas, onMenu, onRetry) {
    this._onClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (this._hitTest(x, y, this._menuBtn)) onMenu();
      if (this._hitTest(x, y, this._retryBtn)) onRetry();
    };
    this._onKey = (e) => {
      if (e.key === 'Enter') onRetry();
      if (e.key === 'Escape') onMenu();
    };
    canvas.addEventListener('click', this._onClick);
    window.addEventListener('keydown', this._onKey);
  }

  disableInput(canvas) {
    if (this._onClick) canvas.removeEventListener('click', this._onClick);
    if (this._onKey) window.removeEventListener('keydown', this._onKey);
    this._onClick = null;
    this._onKey = null;
  }

  _hitTest(x, y, btn) {
    return btn && x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h;
  }
}
