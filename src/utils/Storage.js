const STORAGE_KEY = 'attrape-coeur';
const VERSION = 2;

function defaultProfile() {
  return {
    unlockedLevel: 1,
    bestTimes: {},
    totalHearts: 0,
  };
}

function defaultData() {
  return {
    version: VERSION,
    selectedCharacter: null,
    profiles: {
      joker: defaultProfile(),
      dragon: defaultProfile(),
      squirrel: defaultProfile(),
    },
  };
}

export class Storage {
  static load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultData();
      const data = JSON.parse(raw);
      if (data.version !== VERSION) {
        // Migration depuis v1
        if (data.version === 1 || !data.version) {
          const migrated = defaultData();
          // Reporter les anciennes données sur le dragon (ancien personnage par défaut)
          if (data.unlockedLevel) migrated.profiles.dragon.unlockedLevel = data.unlockedLevel;
          if (data.bestTimes) migrated.profiles.dragon.bestTimes = data.bestTimes;
          if (data.totalHearts) migrated.profiles.dragon.totalHearts = data.totalHearts;
          return migrated;
        }
        return defaultData();
      }
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

  static getProfile(data, characterId) {
    return data.profiles[characterId];
  }
}
