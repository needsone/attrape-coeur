export class MenuScreen {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.selectedLevel = 1;
    this.unlockedLevel = 1;
    this._onClick = null;
    this._onKey = null;
  }

  draw(ctx, width, height, unlockedLevel) {
    this.unlockedLevel = unlockedLevel;

    // Fond
    ctx.fillStyle = '#1A0A2E';
    ctx.fillRect(0, 0, width, height);

    // Titre
    const titleSize = Math.min(48, width * 0.08);
    ctx.font = `bold ${titleSize}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillStyle = '#FF6B9D';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Attrape-Coeur', width / 2, height * 0.15);

    // Sous-titre
    const subSize = Math.min(18, width * 0.03);
    ctx.font = `${subSize}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillStyle = '#B39DDB';
    ctx.fillText('Collecte les coeurs et trouve la sortie !', width / 2, height * 0.23);

    // Grille de niveaux
    const cols = 5;
    const totalLevels = Math.max(10, unlockedLevel + 5);
    const btnSize = Math.min(50, width * 0.08);
    const gap = 10;
    const gridWidth = cols * (btnSize + gap) - gap;
    const startX = (width - gridWidth) / 2;
    const startY = height * 0.35;

    this._buttons = [];

    for (let i = 0; i < totalLevels; i++) {
      const level = i + 1;
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * (btnSize + gap);
      const y = startY + row * (btnSize + gap);
      const unlocked = level <= unlockedLevel;

      // Bouton
      ctx.fillStyle = unlocked
        ? (level === this.selectedLevel ? '#7C4DFF' : '#311B92')
        : '#1A1A2E';
      ctx.beginPath();
      ctx.roundRect(x, y, btnSize, btnSize, 8);
      ctx.fill();

      // Numéro
      ctx.fillStyle = unlocked ? '#F0E6FF' : '#444';
      ctx.font = `bold ${btnSize * 0.4}px 'Segoe UI', system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(unlocked ? level : '🔒', x + btnSize / 2, y + btnSize / 2);

      if (unlocked) {
        this._buttons.push({ level, x, y, w: btnSize, h: btnSize });
      }
    }

    // Instructions
    ctx.font = `${subSize}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillStyle = '#7C4DFF';
    ctx.fillText('Clique sur un niveau ou appuie sur Entrée', width / 2, height * 0.9);
  }

  enableInput(canvas, callback) {
    this._onClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const x = (e.clientX - rect.left);
      const y = (e.clientY - rect.top);

      for (const btn of this._buttons) {
        if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
          callback(btn.level);
          return;
        }
      }
    };
    this._onKey = (e) => {
      if (e.key === 'Enter') {
        callback(this.selectedLevel);
      }
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
}
