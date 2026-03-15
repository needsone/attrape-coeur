import { NORD, SUD, EST, OUEST } from '../maze/Maze.js';

export class DPad {
  constructor() {
    this.visible = true;
    this.pressed = null;
    this.btnSize = 0;
    this.cx = 0;
    this.cy = 0;
    this.buttons = [];
    this.bombButton = null;
    this.bombPressed = false;
    this._listeners = [];
    this._repeatInterval = null;
    this._canvas = null;
  }

  layout(width, height) {
    this.btnSize = Math.min(60, Math.floor(width * 0.09));
    const gap = Math.floor(this.btnSize * 0.2);
    const margin = this.btnSize + 15;

    // Position en bas à droite
    this.cx = width - margin - this.btnSize;
    this.cy = height - margin - this.btnSize;

    const s = this.btnSize;
    this.buttons = [
      { dir: NORD,  x: this.cx,            y: this.cy - s - gap, w: s, h: s, label: '▲' },
      { dir: SUD,   x: this.cx,            y: this.cy + s + gap, w: s, h: s, label: '▼' },
      { dir: OUEST, x: this.cx - s - gap,  y: this.cy,           w: s, h: s, label: '◀' },
      { dir: EST,   x: this.cx + s + gap,  y: this.cy,           w: s, h: s, label: '▶' },
    ];

    // Bouton bombe à gauche du D-Pad
    this.bombButton = {
      x: this.cx - 2 * s - 2 * gap,
      y: this.cy,
      w: s,
      h: s,
      label: '💣',
    };
  }

  draw(ctx, bombAvailable = true) {
    if (!this.visible || this.buttons.length === 0) return;

    for (const btn of this.buttons) {
      const isPressed = this.pressed === btn.dir;

      // Fond du bouton
      ctx.fillStyle = isPressed ? 'rgba(124, 77, 255, 0.85)' : 'rgba(49, 27, 146, 0.6)';
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 10);
      ctx.fill();

      // Bordure
      ctx.strokeStyle = isPressed ? '#B388FF' : 'rgba(179, 157, 219, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 10);
      ctx.stroke();

      // Flèche
      ctx.fillStyle = isPressed ? '#FFF' : 'rgba(240, 230, 255, 0.9)';
      ctx.font = `${this.btnSize * 0.45}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    }

    // Bouton bombe
    if (this.bombButton) {
      const btn = this.bombButton;
      const isPressed = this.bombPressed;
      ctx.fillStyle = isPressed
        ? 'rgba(255, 100, 0, 0.9)'
        : bombAvailable ? 'rgba(150, 60, 0, 0.7)' : 'rgba(60, 60, 60, 0.5)';
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 10);
      ctx.fill();

      ctx.strokeStyle = isPressed ? '#FF8800' : bombAvailable ? 'rgba(255, 180, 80, 0.7)' : 'rgba(100, 100, 100, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 10);
      ctx.stroke();

      ctx.fillStyle = bombAvailable ? '#FFF' : 'rgba(150, 150, 150, 0.6)';
      ctx.font = `${this.btnSize * 0.45}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    }
  }

  _hitTest(clientX, clientY) {
    const rect = this._canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    for (const btn of this.buttons) {
      if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
        return btn.dir;
      }
    }
    return null;
  }

  _hitTestBomb(clientX, clientY) {
    if (!this.bombButton) return false;
    const rect = this._canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const b = this.bombButton;
    return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  }

  _startRepeat(dir, onDirection) {
    clearInterval(this._repeatInterval);
    this.pressed = dir;
    onDirection(dir);
    this._repeatInterval = setInterval(() => {
      if (this.pressed === dir) {
        onDirection(dir);
      } else {
        clearInterval(this._repeatInterval);
      }
    }, 150);
  }

  _stopRepeat() {
    this.pressed = null;
    clearInterval(this._repeatInterval);
  }

  enable(canvas, onDirection, onBomb) {
    this._canvas = canvas;
    this._listeners = [];

    const addListener = (target, event, fn, opts) => {
      target.addEventListener(event, fn, opts);
      this._listeners.push({ target, event, fn, opts });
    };

    // Touch
    addListener(canvas, 'touchstart', (e) => {
      const touch = e.touches[0];
      const dir = this._hitTest(touch.clientX, touch.clientY);
      if (dir !== null) {
        e.preventDefault();
        e.stopPropagation();
        this._startRepeat(dir, onDirection);
      } else if (onBomb && this._hitTestBomb(touch.clientX, touch.clientY)) {
        e.preventDefault();
        e.stopPropagation();
        this.bombPressed = true;
        onBomb();
      }
    }, { passive: false });

    addListener(canvas, 'touchend', () => {
      this._stopRepeat();
      this.bombPressed = false;
    });
    addListener(canvas, 'touchcancel', () => {
      this._stopRepeat();
      this.bombPressed = false;
    });

    // Souris (pour desktop aussi)
    addListener(canvas, 'mousedown', (e) => {
      const dir = this._hitTest(e.clientX, e.clientY);
      if (dir !== null) {
        e.preventDefault();
        this._startRepeat(dir, onDirection);
      } else if (onBomb && this._hitTestBomb(e.clientX, e.clientY)) {
        e.preventDefault();
        this.bombPressed = true;
        onBomb();
      }
    });

    addListener(window, 'mouseup', () => {
      if (this.pressed !== null) this._stopRepeat();
      this.bombPressed = false;
    });
  }

  disable() {
    this._stopRepeat();
    for (const { target, event, fn, opts } of this._listeners) {
      target.removeEventListener(event, fn, opts);
    }
    this._listeners = [];
    this._canvas = null;
  }
}
