import { EventBus } from './utils/EventBus.js';
import { Storage } from './utils/Storage.js';
import { Renderer } from './rendering/Renderer.js';
import { MazeGenerator } from './maze/MazeGenerator.js';
import { MazeSolver } from './maze/MazeSolver.js';
import { Player } from './entities/Player.js';
import { Heart } from './entities/Heart.js';
import { Bomb } from './entities/Bomb.js';
import { InputSystem } from './systems/InputSystem.js';
import { TimerSystem } from './systems/TimerSystem.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { LevelSystem } from './systems/LevelSystem.js';
import { ScreenManager, SCREENS } from './ui/ScreenManager.js';
import { MenuScreen } from './ui/MenuScreen.js';
import { ResultScreen } from './ui/ResultScreen.js';
import { CharacterSelectScreen } from './ui/CharacterSelectScreen.js';
import { DPad } from './systems/DPad.js';

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
    this.characterSelectScreen = new CharacterSelectScreen();
    this.dpad = new DPad();

    this.saveData = Storage.load();
    this.characterId = this.saveData.selectedCharacter;
    this.currentLevel = 1;
    this.maze = null;
    this.player = null;
    this.hearts = [];
    this.bomb = null;
    this.heartsCollected = 0;
    this.levelConfig = null;

    this.accumulator = 0;
    this.lastTime = 0;
    this.rafId = null;
    this.lastUITime = -1;
    this.levelEnded = false;
    this.explosionTime = null;

    this._setupEvents();
    this._setupResize();
  }

  get profile() {
    return Storage.getProfile(this.saveData, this.characterId);
  }

  start() {
    this.renderer.resize();
    if (this.characterId) {
      this.renderer.playerRenderer.setCharacter(this.characterId);
      this.showMenu();
    } else {
      this.showCharacterSelect();
    }
  }

  _setupEvents() {
    this.eventBus.on('heart:collected', () => {
      this.heartsCollected++;
      this.renderer.playerRenderer.triggerFire();
    });

    this.eventBus.on('bomb:used', () => {
      // Redessiner le labyrinthe statique car des murs ont été cassés
      this.renderer.drawStatic(this.maze);
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
        this.dpad.layout(this.renderer.width, this.renderer.height);
      } else if (this.screenManager.is(SCREENS.MENU)) {
        this.showMenu();
      } else if (this.screenManager.is(SCREENS.CHARACTER_SELECT)) {
        this.showCharacterSelect();
      }
    };
    window.addEventListener('resize', onResize);
  }

  showCharacterSelect() {
    this._stopLoop();
    this.input.disable();
    this.dpad.disable();
    this.menuScreen.disableInput(this.renderer.uiCanvas);
    this.resultScreen.disableInput(this.renderer.uiCanvas);
    this.screenManager.switchTo(SCREENS.CHARACTER_SELECT);

    this.renderer.drawOverlay((ctx, w, h) => {
      this.characterSelectScreen.draw(ctx, w, h, this.saveData.profiles);
    });

    this.characterSelectScreen.enableInput(this.renderer.uiCanvas, (charId) => {
      this.characterSelectScreen.disableInput(this.renderer.uiCanvas);
      this.characterId = charId;
      this.saveData.selectedCharacter = charId;
      Storage.save(this.saveData);
      this.renderer.playerRenderer.setCharacter(charId);
      this.showMenu();
    });
  }

  showMenu() {
    this._stopLoop();
    this.input.disable();
    this.dpad.disable();
    this.resultScreen.disableInput(this.renderer.uiCanvas);
    this.characterSelectScreen.disableInput(this.renderer.uiCanvas);
    this.screenManager.switchTo(SCREENS.MENU);

    const profile = this.profile;

    this.renderer.drawOverlay((ctx, w, h) => {
      this.menuScreen.draw(ctx, w, h, profile.unlockedLevel, this.characterId, profile.bestTimes);
    });

    this.menuScreen.enableInput(
      this.renderer.uiCanvas,
      (level) => {
        this.menuScreen.disableInput(this.renderer.uiCanvas);
        this.startLevel(level);
      },
      () => {
        this.menuScreen.disableInput(this.renderer.uiCanvas);
        this.showCharacterSelect();
      }
    );
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
    this.levelEnded = false;
    this.explosionTime = null;

    // Le joueur porte la bombe avec lui
    this.bomb = new Bomb();

    this.renderer.resize();
    this.renderer.computeLayout(this.maze);
    this.renderer.drawStatic(this.maze);

    this.timer.start(timeLimit);
    this.input.enable();
    this.dpad.layout(this.renderer.width, this.renderer.height);
    this.dpad.enable(
      this.renderer.uiCanvas,
      (dir) => { this.input.moveQueue.push(dir); },
      () => { this.input._bombPending = true; }
    );
    this.screenManager.switchTo(SCREENS.GAME);

    this.lastUITime = -1;
    this._startLoop();
  }

  _endLevel(timeout, killedByBomb = false) {
    if (this.levelEnded) return;
    this.levelEnded = true;
    this._stopLoop();
    this.input.disable();
    this.dpad.disable();
    this.timer.stop();

    const success = !timeout && !killedByBomb && this.heartsCollected >= this.levelConfig.requiredHearts;
    const timeUsed = this.levelConfig.timeLimit - this.timer.remaining;
    const profile = this.profile;

    if (success) {
      if (this.currentLevel >= profile.unlockedLevel) {
        profile.unlockedLevel = this.currentLevel + 1;
      }
      const best = profile.bestTimes[this.currentLevel];
      if (!best || timeUsed < best) {
        profile.bestTimes[this.currentLevel] = Math.round(timeUsed * 10) / 10;
      }
      profile.totalHearts += this.heartsCollected;
      Storage.save(this.saveData);
    }

    const resultData = {
      level: this.currentLevel,
      success,
      timeout,
      killedByBomb,
      heartsCollected: this.heartsCollected,
      heartsTotal: this.levelConfig.totalHearts,
      timeUsed,
      characterId: this.characterId,
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
      if (this.levelEnded) return;
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
      this.collision.check(this.player, this.maze, this.hearts, this.levelConfig.requiredHearts);
    }

    // Poser la bombe (espace ou bouton D-Pad)
    if (this.input.getBombAction() && !this.bomb.placed && !this.bomb.exploded) {
      this.bomb.place(this.player.row, this.player.col);
    }

    // Vérifier l'explosion de la bombe
    const now = performance.now();
    if (this.bomb.shouldExplode(now)) {
      this.bomb.explode();
      this.maze.breakWalls(this.bomb.row, this.bomb.col);
      this.explosionTime = now;
      this.eventBus.emit('bomb:used', this.bomb);

      // Le joueur est trop proche → mort
      const dr = Math.abs(this.player.row - this.bomb.row);
      const dc = Math.abs(this.player.col - this.bomb.col);
      if (dr + dc <= 2) {
        this._endLevel(false, true);
      }
    }
  }

  _render(alpha) {
    const now = performance.now();
    this.renderer.drawDynamic(this.player, this.hearts, this.bomb, alpha, this.explosionTime, now);

    // UI mise à jour chaque seconde (ou plus souvent si bombe en cours)
    const sec = Math.floor(this.timer.remaining);
    const bombActive = this.bomb.placed && !this.bomb.exploded;
    if (sec !== this.lastUITime || this.dpad.visible || bombActive) {
      this.lastUITime = sec;

      let bombState = 'held';
      if (this.bomb.exploded) bombState = 'exploded';
      else if (this.bomb.placed) bombState = 'placed';

      this.renderer.drawUI({
        level: this.currentLevel,
        timeRemaining: this.timer.remaining,
        heartsCollected: this.heartsCollected,
        heartsTotal: this.levelConfig.totalHearts,
        heartsRequired: this.levelConfig.requiredHearts,
        bombState,
        bombCountdown: bombActive ? this.bomb.countdown(now) : 0,
      });
      this.dpad.draw(this.renderer.uiCtx, !this.bomb.placed && !this.bomb.exploded);
    }
  }
}
