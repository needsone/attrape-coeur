export class Heart {
  constructor(row, col, id) {
    this.row = row;
    this.col = col;
    this.id = id;
    this.collected = false;
  }

  collect() {
    this.collected = true;
  }
}
