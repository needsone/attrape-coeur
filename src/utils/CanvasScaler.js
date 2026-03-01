export class CanvasScaler {
  static setup(canvas, width, height) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return ctx;
  }

  static computeGameArea() {
    const padding = 20;
    const w = window.innerWidth - padding * 2;
    const h = window.innerHeight - padding * 2;
    return { width: Math.floor(w), height: Math.floor(h) };
  }
}
