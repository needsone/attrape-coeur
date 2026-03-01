const CACHE_NAME = 'attrape-coeur-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './src/main.js',
  './src/Game.js',
  './src/maze/Maze.js',
  './src/maze/MazeGenerator.js',
  './src/maze/MazeSolver.js',
  './src/entities/Player.js',
  './src/entities/Heart.js',
  './src/rendering/Renderer.js',
  './src/rendering/MazeRenderer.js',
  './src/rendering/PlayerRenderer.js',
  './src/rendering/UIRenderer.js',
  './src/systems/InputSystem.js',
  './src/systems/TimerSystem.js',
  './src/systems/CollisionSystem.js',
  './src/systems/DPad.js',
  './src/systems/LevelSystem.js',
  './src/ui/ScreenManager.js',
  './src/ui/MenuScreen.js',
  './src/ui/ResultScreen.js',
  './src/utils/EventBus.js',
  './src/utils/MathUtils.js',
  './src/utils/Storage.js',
  './src/utils/CanvasScaler.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
