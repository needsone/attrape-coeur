export const SCREENS = {
  CHARACTER_SELECT: 'character_select',
  MENU: 'menu',
  GAME: 'game',
  RESULT: 'result',
  GAMEOVER: 'gameover',
};

export class ScreenManager {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.current = SCREENS.MENU;
  }

  switchTo(screen, data) {
    this.current = screen;
    this.eventBus.emit('screen:change', { screen, data });
  }

  is(screen) {
    return this.current === screen;
  }
}
