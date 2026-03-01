export class UIRenderer {
  draw(ctx, width, height, state) {
    ctx.clearRect(0, 0, width, height);

    const hudY = 20;
    const fontSize = Math.min(20, width * 0.035);
    ctx.font = `bold ${fontSize}px 'Segoe UI', system-ui, sans-serif`;
    ctx.textBaseline = 'top';

    // Niveau
    ctx.fillStyle = '#B39DDB';
    ctx.textAlign = 'left';
    ctx.fillText(`Niveau ${state.level}`, 15, hudY);

    // Timer
    const minutes = Math.floor(state.timeRemaining / 60);
    const seconds = Math.floor(state.timeRemaining % 60);
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    ctx.textAlign = 'center';
    if (state.timeRemaining <= 30) {
      ctx.fillStyle = '#FF5252';
    } else if (state.timeRemaining <= 60) {
      ctx.fillStyle = '#FFD740';
    } else {
      ctx.fillStyle = '#F0E6FF';
    }
    ctx.fillText(timeStr, width / 2, hudY);

    // Coeurs
    ctx.textAlign = 'right';
    ctx.fillStyle = '#FF6B9D';
    const heartStr = `♥ ${state.heartsCollected}/${state.heartsRequired}`;
    ctx.fillText(heartStr, width - 15, hudY);
  }
}
