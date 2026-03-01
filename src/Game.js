import { EventBus } from './utils/EventBus.js';
import { Storage } from './utils/Storage.js';
import { Renderer } from './rendering/Renderer.js';
import { MazeGenerator } from './maze/MazeGenerator.js';
import { MazeSolver } from './maze/MazeSolver.js';
import { Player } from './entities/Player.js';
import { Heart } from './entities/Heart.js';
import { InputSystem } from './systems/InputSystem.js';
import { TimerSystem } from './systems/TimerSystem.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { LevelSystem } from './systems/LevelSystem.js';
import { ScreenManager, SCREENS } from './ui/ScreenManager.js';
import { MenuScreen } from './ui/MenuScreen.js';
import { ResultScreen } from './ui/ResultScreen.js';

const FIXED_DT = 1000 / 60;

export class Game {
  constructor() {
    this.eventBus = new EventBus();
    this.renderer = new Renderer();
    this.input = new InputSystem();
    this.timer = new TimerSystem(this.eventBus);
    this.collision = new CollisionSystem(this.eventBus);
    this.screenManager = new ScreenManager(this.eventBus);
    this.menuScreen = new MenuScreen(this.eventBus);
    this.resultScreen = new ResultScreen();

    this.saveData = Storage.load();
    this.currentLevel = 1;
    this.maze = null;
    this.player = null;
    this.hearts = [];
    this.heartsCollected = 0;
    this.levelConfig = null;

    this.accumulator = 0;
    this.lastTime = 0;
    this.rafId = null;
    this.lastUITime = -1;

    this._setupEvents();
    this._setupResize();
  }

  start() {
    this.renderer.resize();
    this.showMenu();
  }

  _setupEvents() {
    this.eventBus.on('heart:collected', () => {
      this.heartsCollected++;
      this.renderer.playerRenderer.triggerFire();
    });

    this.eventBus.on('exit:reached', () => {
      this._endLevel(false);
    });

    this.eventBus.on('timer:expired', () => {
      this._endLevel(true);
    });
  }

  _setupResize() {
    const onResize = () => {
      this.renderer.resize();
      if (this.screenManager.is(SCREENS.GAME) && this.maze) {
        this.renderer.computeLayout(this.maze);
        this.renderer.drawStatic(this.maze);
      } else if (this.screenManager.is(SCREENS.MENU)) {
        this.showMenu();
      }
    };
    window.addEventListener('resize', onResize);
  }

  showMenu() {
    this._stopLoop();
    this.input.disable();
    this.resultScreen.disableInput(this.renderer.uiCanvas);
    this.screenManager.switchTo(SCREENS.MENU);

    this.renderer.drawOverlay((ctx, w, h) => {
      this.menuScreen.draw(ctx, w, h, this.saveData.unlockedLevel);
    });

    this.menuScreen.enableInput(this.renderer.uiCanvas, (level) => {
      this.menuScreen.disableInput(this.renderer.uiCanvas);
      this.startLevel(level);
    });
  }

  startLevel(level) {
    this.currentLevel = level;
    this.levelConfig = LevelSystem.getConfig(level);
    const { cols, rows, seed, totalHearts, timeLimit } = this.levelConfig;

    this.maze = MazeGenerator.generate(cols, rows, seed);
    this.player = new Player(this.maze.entry.row, this.maze.entry.col);

    const heartPositions = MazeSolver.placeHearts(this.maze, totalHearts);
    this.hearts = heartPositions.map((pos, i) => new Heart(pos.row, pos.col, i));
    this.heartsCollected = 0;

    this.renderer.resize();
    this.renderer.computeLayout(this.maze);
    this.renderer.drawStatic(this.maze);

    this.timer.start(timeLimit);
    this.input.enable();
    this.screenManager.switchTo(SCREENS.GAME);

    this.lastUITime = -1;
    this._startLoop();
  }

  _endLevel(timeout) {
    this._stopLoop();
    this.input.disable();
    this.timer.stop();

    const success = !timeout && this.heartsCollected >= this.levelConfig.requiredHearts;
    const timeUsed = this.levelConfig.timeLimit - this.timer.remaining;

    if (success) {
      if (this.currentLevel >= this.saveData.unlockedLevel) {
        this.saveData.unlockedLevel = this.currentLevel + 1;
      }
      const best = this.saveData.bestTimes[this.currentLevel];
      if (!best || timeUsed < best) {
        this.saveData.bestTimes[this.currentLevel] = Math.round(timeUsed * 10) / 10;
      }
      this.saveData.totalHearts += this.heartsCollected;
      Storage.save(this.saveData);
    }

    const resultData = {
      level: this.currentLevel,
      success,
      timeout,
      heartsCollected: this.heartsCollected,
      heartsTotal: this.levelConfig.totalHearts,
      timeUsed,
    };

    this.screenManager.switchTo(SCREENS.RESULT);
    this.renderer.drawOverlay((ctx, w, h) => {
      this.resultScreen.draw(ctx, w, h, resultData);
    });

    this.resultScreen.enableInput(
      this.renderer.uiCanvas,
      () => this.showMenu(),
      () => {
        this.resultScreen.disableInput(this.renderer.uiCanvas);
        if (success) {
          this.startLevel(this.currentLevel + 1);
        } else {
          this.startLevel(this.currentLevel);
        }
      }
    );
  }

  _startLoop() {
    this.accumulator = 0;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame((t) => this._loop(t));
  }

  _stopLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  _loop(timestamp) {
    const delta = Math.min(timestamp - this.lastTime, 100);
    this.lastTime = timestamp;
    this.accumulator += delta;

    while (this.accumulator >= FIXED_DT) {
      this._update(FIXED_DT);
      this.accumulator -= FIXED_DT;
    }

    const alpha = this.accumulator / FIXED_DT;
    this._render(alpha);

    this.rafId = requestAnimationFrame((t) => this._loop(t));
  }

  _update(dt) {
    this.timer.update(dt);
    this.renderer.playerRenderer.update(dt);
    this.player.snapInterpolation();

    const dir = this.input.getDirection();
    if (dir !== null && this.maze.canMove(this.player.row, this.player.col, dir)) {
      this.player.moveTo(dir);
      this.collision.check(this.player, this.maze, this.hearts);
    }
  }

  _render(alpha) {
    this.renderer.drawDynamic(this.player, this.hearts, alpha);

    // UI mise à jour chaque seconde
    const sec = Math.floor(this.timer.remaining);
    if (sec !== this.lastUITime) {
      this.lastUITime = sec;
      this.renderer.drawUI({
        level: this.currentLevel,
        timeRemaining: this.timer.remaining,
        heartsCollected: this.heartsCollected,
        heartsRequired: this.levelConfig.requiredHearts,
      });
    }
  }
}
