import { NORD, SUD, EST, OUEST } from '../maze/Maze.js';

const KEY_MAP = {
  ArrowUp: NORD,
  ArrowDown: SUD,
  ArrowRight: EST,
  ArrowLeft: OUEST,
};

export class InputSystem {
  constructor() {
    this.keys = new Set();
    this.moveQueue = [];
    this.moveDelay = 150;
    this.lastMove = 0;
    this.active = false;

    this._onKeyDown = (e) => {
      if (KEY_MAP[e.key] !== undefined) {
        e.preventDefault();
        this.keys.add(e.key);
      }
    };
    this._onKeyUp = (e) => {
      this.keys.delete(e.key);
    };

    this.touchStart = null;
    this._onTouchStart = (e) => {
      if (!this.active) return;
      e.preventDefault();
      this.touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    this._onTouchEnd = (e) => {
      if (!this.active || !this.touchStart) return;
      const dx = e.changedTouches[0].clientX - this.touchStart.x;
      const dy = e.changedTouches[0].clientY - this.touchStart.y;
      const threshold = 20;

      if (Math.max(Math.abs(dx), Math.abs(dy)) > threshold) {
        if (Math.abs(dx) > Math.abs(dy)) {
          this.moveQueue.push(dx > 0 ? EST : OUEST);
        } else {
          this.moveQueue.push(dy > 0 ? SUD : NORD);
        }
      }
      this.touchStart = null;
    };
  }

  enable() {
    this.active = true;
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('touchstart', this._onTouchStart, { passive: false });
    window.addEventListener('touchend', this._onTouchEnd);
  }

  disable() {
    this.active = false;
    this.keys.clear();
    this.moveQueue = [];
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('touchstart', this._onTouchStart);
    window.removeEventListener('touchend', this._onTouchEnd);
  }

  getDirection() {
    const now = Date.now();
    if (now - this.lastMove < this.moveDelay) return null;

    // Priorité à la file touch
    if (this.moveQueue.length > 0) {
      this.lastMove = now;
      return this.moveQueue.shift();
    }

    // Sinon clavier
    for (const [key, dir] of Object.entries(KEY_MAP)) {
      if (this.keys.has(key)) {
        this.lastMove = now;
        return dir;
      }
    }

    return null;
  }
}
