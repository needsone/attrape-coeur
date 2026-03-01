export class CollisionSystem {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  check(player, maze, hearts) {
    // Collecte des coeurs
    for (const heart of hearts) {
      if (!heart.collected && player.isAt(heart.row, heart.col)) {
        heart.collect();
        this.eventBus.emit('heart:collected', heart);
      }
    }

    // Arrivée à la sortie
    if (player.isAt(maze.exit.row, maze.exit.col)) {
      this.eventBus.emit('exit:reached');
    }
  }
}
