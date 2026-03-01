export class LevelSystem {
  static getConfig(level) {
    const baseCols = 7;
    const baseRows = 7;
    const cols = Math.min(25, baseCols + Math.floor(level / 2));
    const rows = Math.min(25, baseRows + Math.floor(level / 2));
    const totalHearts = 1 + Math.floor(level / 3);
    const requiredHearts = Math.max(1, Math.ceil(totalHearts * 0.5));
    const timeLimit = Math.max(60, 180 - level * 3);
    const seed = (level * 2654435761) >>> 0;

    return { cols, rows, totalHearts, requiredHearts, timeLimit, seed };
  }
}
