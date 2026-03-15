# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Attrape-Coeur est un jeu de labyrinthe en PWA ciblant iPad et desktop. Le joueur complète des labyrinthes générés procéduralement en moins de 3 minutes, collectant TOUS les coeurs cachés dans les impasses pour débloquer les niveaux suivants. Une bombe par niveau permet de casser des murs pour accéder aux coeurs inaccessibles.

## Stack

Vanilla JS + HTML5 Canvas, modules ES natifs (pas de bundler). Pas de framework ni dépendances externes.

## Lancer le jeu

```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

## Architecture

- **3 canvas superposés** : `layer-bg` (labyrinthe statique), `layer-dynamic` (joueur/coeurs/bombe à 60fps), `layer-ui` (HUD timer)
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
  entities/            → Player (position grille) + Heart (collectible) + Bomb (destructible)
  rendering/           → MazeRenderer, PlayerRenderer (3 personnages), UIRenderer, Renderer (orchestrateur)
  systems/             → InputSystem (clavier+touch), TimerSystem, CollisionSystem, LevelSystem
  ui/                  → ScreenManager, MenuScreen, ResultScreen, CharacterSelectScreen
  utils/               → EventBus (pub/sub), MathUtils, Storage (localStorage multi-comptes), CanvasScaler (DPR)
```

## Difficulté progressive

Taille grille : `7 + floor(level/2)`, max 25. Coeurs : `1 + floor(level/3)`, requis : 100% (tous). Timer : `180s - level*3`, min 60s.

## Personnages (3 comptes séparés)

- **Joker** : bouffon du roi avec chapeau à grelots, effet confettis à la collecte
- **Dragon Tsunami** : dragon bleu des royaumes de feu, crache du feu bleu à la collecte
- **Écureuil** : petit écureuil brun avec queue touffue, effet feuilles à la collecte

Chaque personnage a sa propre progression (niveaux débloqués, meilleurs temps). Storage v2 avec profils séparés.

## Bombe

Une bombe par labyrinthe, placée stratégiquement (cellule avec le plus de murs fermés, hors chemin principal). Quand le joueur marche dessus, elle casse les 4 murs internes autour (les bordures externes sont préservées). Le labyrinthe statique est redessiné après l'explosion.

## Contrôles

- Desktop : flèches directionnelles
- iPad : swipe touch (threshold 20px) + D-Pad tactile

## Langue

Le projet est en français. Les messages utilisateur et commentaires doivent être rédigés en français.
