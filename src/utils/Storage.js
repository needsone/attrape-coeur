const STORAGE_KEY = 'attrape-coeur';
const VERSION = 1;

function defaultData() {
  return {
    version: VERSION,
    currentLevel: 1,
    unlockedLevel: 1,
    bestTimes: {},
    totalHearts: 0,
  };
}

export class Storage {
  static load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultData();
      const data = JSON.parse(raw);
      if (data.version !== VERSION) return defaultData();
      return data;
    } catch {
      return defaultData();
    }
  }

  static save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  static reset() {
    localStorage.removeItem(STORAGE_KEY);
  }
}
