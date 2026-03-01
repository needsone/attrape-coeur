import { NORD, SUD, EST, OUEST } from '../maze/Maze.js';

export class DPad {
  constructor() {
    this.visible = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    this.pressed = null;
    this.btnSize = 0;
    this.cx = 0;
    this.cy = 0;
    this.buttons = [];
    this._onTouchStart = null;
    this._onTouchEnd = null;
    this._onTouchMove = null;
    this._repeatInterval = null;
    this._canvas = null;
  }

  layout(width, height) {
    this.btnSize = Math.min(52, Math.floor(width * 0.07));
    const gap = Math.floor(this.btnSize * 0.15);
    const margin = this.btnSize + 10;

    // Position en bas à droite
    this.cx = width - margin - this.btnSize;
    this.cy = height - margin - this.btnSize;

    const s = this.btnSize;
    this.buttons = [
      { dir: NORD,  x: this.cx,         y: this.cy - s - gap, w: s, h: s, label: '▲' },
      { dir: SUD,   x: this.cx,         y: this.cy + s + gap, w: s, h: s, label: '▼' },
      { dir: OUEST, x: this.cx - s - gap, y: this.cy,         w: s, h: s, label: '◀' },
      { dir: EST,   x: this.cx + s + gap, y: this.cy,         w: s, h: s, label: '▶' },
    ];
  }

  draw(ctx) {
    if (!this.visible) return;

    for (const btn of this.buttons) {
      const isPressed = this.pressed === btn.dir;

      // Fond du bouton
      ctx.fillStyle = isPressed ? 'rgba(124, 77, 255, 0.7)' : 'rgba(49, 27, 146, 0.5)';
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 10);
      ctx.fill();

      // Bordure
      ctx.strokeStyle = isPressed ? '#B388FF' : 'rgba(179, 157, 219, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 10);
      ctx.stroke();

      // Flèche
      ctx.fillStyle = isPressed ? '#FFF' : 'rgba(240, 230, 255, 0.8)';
      ctx.font = `${this.btnSize * 0.4}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    }
  }

  enable(canvas, onDirection) {
    if (!this.visible) return;
    this._canvas = canvas;

    const getDir = (e) => {
      const touch = e.touches[0] || e.changedTouches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      for (const btn of this.buttons) {
        if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
          return btn.dir;
        }
      }
      return null;
    };

    this._onTouchStart = (e) => {
      const dir = getDir(e);
      if (dir !== null) {
        e.preventDefault();
        e.stopPropagation();
        this.pressed = dir;
        onDirection(dir);

        // Répétition si on maintient appuyé
        clearInterval(this._repeatInterval);
        this._repeatInterval = setInterval(() => {
          if (this.pressed === dir) {
            onDirection(dir);
          } else {
            clearInterval(this._repeatInterval);
          }
        }, 150);
      }
    };

    this._onTouchMove = (e) => {
      const dir = getDir(e);
      if (this.pressed !== null && dir !== this.pressed) {
        this.pressed = dir;
      }
    };

    this._onTouchEnd = (e) => {
      this.pressed = null;
      clearInterval(this._repeatInterval);
    };

    canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', this._onTouchMove, { passive: false });
    canvas.addEventListener('touchend', this._onTouchEnd);
  }

  disable() {
    clearInterval(this._repeatInterval);
    this.pressed = null;
    if (!this._canvas) return;
    if (this._onTouchStart) this._canvas.removeEventListener('touchstart', this._onTouchStart);
    if (this._onTouchMove) this._canvas.removeEventListener('touchmove', this._onTouchMove);
    if (this._onTouchEnd) this._canvas.removeEventListener('touchend', this._onTouchEnd);
    this._onTouchStart = null;
    this._onTouchMove = null;
    this._onTouchEnd = null;
    this._canvas = null;
  }
}
