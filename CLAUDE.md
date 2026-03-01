# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Attrape-Coeur est un jeu de labyrinthe en PWA ciblant iPad et desktop. Le joueur complète des labyrinthes générés procéduralement en moins de 3 minutes, collectant des coeurs cachés dans les impasses pour débloquer les niveaux suivants.

## Stack

Vanilla JS + HTML5 Canvas, modules ES natifs (pas de bundler). Pas de framework ni dépendances externes.

## Lancer le jeu

```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

## Architecture

- **3 canvas superposés** : `layer-bg` (labyrinthe statique), `layer-dynamic` (joueur/coeurs à 60fps), `layer-ui` (HUD timer)
- **Game loop** : fixed timestep (60 updates/s) avec interpolation pour le rendu
- **Mouvement grille** : le joueur se déplace de cellule en cellule, l'interpolation est uniquement visuelle dans le renderer
- **Murs en bitmask** : chaque cellule = Uint8 (NORD=1, SUD=2, EST=4, OUEST=8) dans `src/maze/Maze.js`
- **PRNG seedé** (Mulberry32) : `seed = level * 2654435761` → même niveau = même labyrinthe

## Structure des modules

```
src/
  main.js              → Bootstrap + enregistrement SW
  Game.js              → Orchestrateur (game loop, gestion écrans, événements)
  maze/                → Génération (Recursive Backtracker) + résolution (BFS)
  entities/            → Player (position grille) + Heart (collectible)
  rendering/           → MazeRenderer, PlayerRenderer, UIRenderer, Renderer (orchestrateur)
  systems/             → InputSystem (clavier+touch), TimerSystem, CollisionSystem, LevelSystem
  ui/                  → ScreenManager, MenuScreen, ResultScreen
  utils/               → EventBus (pub/sub), MathUtils, Storage (localStorage), CanvasScaler (DPR)
```

## Difficulté progressive

Taille grille : `7 + floor(level/2)`, max 25. Coeurs : `1 + floor(level/3)`, requis : 50%. Timer : `180s - level*3`, min 60s.

## Personnage

Le joueur est un petit dragon vert (dessiné en Canvas 2D) qui crache du feu pendant 600ms quand il collecte un coeur. Le dragon a une propriété `facing` qui suit la direction du dernier déplacement.

## Contrôles

- Desktop : flèches directionnelles
- iPad : swipe touch (threshold 20px)

## Langue

Le projet est en français. Les messages utilisateur et commentaires doivent être rédigés en français.
