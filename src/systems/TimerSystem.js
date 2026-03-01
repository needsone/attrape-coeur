export class TimerSystem {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.remaining = 0;
    this.running = false;
  }

  start(seconds) {
    this.remaining = seconds;
    this.running = true;
  }

  stop() {
    this.running = false;
  }

  update(dt) {
    if (!this.running) return;
    this.remaining -= dt / 1000;
    if (this.remaining <= 0) {
      this.remaining = 0;
      this.running = false;
      this.eventBus.emit('timer:expired');
    }
  }
}
