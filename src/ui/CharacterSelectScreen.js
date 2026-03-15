export const CHARACTERS = {
  joker: { id: 'joker', name: 'Joker', emoji: '🃏', description: 'Le fou du roi' },
  dragon: { id: 'dragon', name: 'Dragon Tsunami', emoji: '🐉', description: 'Des royaumes de feu' },
  squirrel: { id: 'squirrel', name: 'Écureuil', emoji: '🐿️', description: 'Agile et rusé' },
};

export const CHARACTER_LIST = Object.values(CHARACTERS);

export class CharacterSelectScreen {
  constructor() {
    this._onClick = null;
    this._onKey = null;
    this._buttons = [];
    this.selectedIndex = 0;
  }

  draw(ctx, width, height, profiles) {
    ctx.fillStyle = '#1A0A2E';
    ctx.fillRect(0, 0, width, height);

    // Titre
    const titleSize = Math.min(42, width * 0.07);
    ctx.font = `bold ${titleSize}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillStyle = '#FF6B9D';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Choisis ton personnage', width / 2, height * 0.12);

    const cardW = Math.min(220, width * 0.28);
    const cardH = Math.min(280, height * 0.55);
    const gap = Math.min(30, width * 0.03);
    const totalW = CHARACTER_LIST.length * cardW + (CHARACTER_LIST.length - 1) * gap;
    const startX = (width - totalW) / 2;
    const cardY = height * 0.22;

    this._buttons = [];

    CHARACTER_LIST.forEach((char, i) => {
      const x = startX + i * (cardW + gap);
      const profile = profiles[char.id];
      const level = profile ? profile.unlockedLevel : 1;
      const totalBest = profile ? Object.keys(profile.bestTimes).length : 0;

      // Carte
      const isSelected = i === this.selectedIndex;
      ctx.fillStyle = isSelected ? '#311B92' : '#120826';
      ctx.strokeStyle = isSelected ? '#7C4DFF' : '#6B3FA0';
      ctx.lineWidth = isSelected ? 3 : 1;
      ctx.beginPath();
      ctx.roundRect(x, cardY, cardW, cardH, 12);
      ctx.fill();
      ctx.stroke();

      // Emoji personnage
      const emojiSize = Math.min(60, cardW * 0.3);
      ctx.font = `${emojiSize}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText(char.emoji, x + cardW / 2, cardY + cardH * 0.2);

      // Nom
      const nameSize = Math.min(20, cardW * 0.1);
      ctx.font = `bold ${nameSize}px 'Segoe UI', system-ui, sans-serif`;
      ctx.fillStyle = '#F0E6FF';
      ctx.fillText(char.name, x + cardW / 2, cardY + cardH * 0.4);

      // Description
      const descSize = Math.min(14, cardW * 0.07);
      ctx.font = `${descSize}px 'Segoe UI', system-ui, sans-serif`;
      ctx.fillStyle = '#B39DDB';
      ctx.fillText(char.description, x + cardW / 2, cardY + cardH * 0.5);

      // Stats
      ctx.fillStyle = '#7C4DFF';
      ctx.font = `${descSize}px 'Segoe UI', system-ui, sans-serif`;
      ctx.fillText(`Niveau max : ${level}`, x + cardW / 2, cardY + cardH * 0.65);
      ctx.fillText(`Records : ${totalBest}`, x + cardW / 2, cardY + cardH * 0.73);

      // Meilleur temps global (premier niveau complété)
      if (profile && profile.bestTimes[1]) {
        const t = profile.bestTimes[1];
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        ctx.fillStyle = '#00E676';
        ctx.fillText(`Niv.1 : ${m}:${s.toString().padStart(2, '0')}`, x + cardW / 2, cardY + cardH * 0.81);
      }

      // Bouton jouer
      const btnH = Math.min(40, cardH * 0.12);
      const btnY = cardY + cardH - btnH - 10;
      ctx.fillStyle = isSelected ? '#7C4DFF' : '#311B92';
      ctx.beginPath();
      ctx.roundRect(x + 15, btnY, cardW - 30, btnH, 8);
      ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.font = `bold ${Math.min(16, btnH * 0.45)}px 'Segoe UI', system-ui, sans-serif`;
      ctx.fillText('Jouer', x + cardW / 2, btnY + btnH / 2);

      this._buttons.push({ index: i, charId: char.id, x, y: cardY, w: cardW, h: cardH });
    });
  }

  enableInput(canvas, callback) {
    this._onClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (const btn of this._buttons) {
        if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
          callback(btn.charId);
          return;
        }
      }
    };
    this._onKey = (e) => {
      if (e.key === 'ArrowLeft') {
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      } else if (e.key === 'ArrowRight') {
        this.selectedIndex = Math.min(CHARACTER_LIST.length - 1, this.selectedIndex + 1);
      } else if (e.key === 'Enter') {
        callback(CHARACTER_LIST[this.selectedIndex].id);
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
