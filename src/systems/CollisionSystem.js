export class CollisionSystem {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  check(player, maze, hearts, requiredHearts) {
    // Collecte des coeurs
    let collected = 0;
    for (const heart of hearts) {
      if (!heart.collected && player.isAt(heart.row, heart.col)) {
        heart.collect();
        this.eventBus.emit('heart:collected', heart);
      }
      if (heart.collected) collected++;
    }

    // Arrivée à la sortie uniquement si assez de coeurs
    if (player.isAt(maze.exit.row, maze.exit.col) && collected >= requiredHearts) {
      this.eventBus.emit('exit:reached');
    }
  }
}
