export class Bomb {
  constructor() {
    this.row = null;
    this.col = null;
    this.placed = false;
    this.placedAt = null;
    this.exploded = false;
  }

  place(row, col) {
    this.row = row;
    this.col = col;
    this.placed = true;
    this.placedAt = performance.now();
  }

  // Retourne le temps restant en secondes (0 à 2)
  countdown(now) {
    if (!this.placed || this.exploded) return 0;
    return Math.max(0, 2 - (now - this.placedAt) / 1000);
  }

  shouldExplode(now) {
    return this.placed && !this.exploded && (now - this.placedAt) >= 2000;
  }

  explode() {
    this.exploded = true;
  }
}
