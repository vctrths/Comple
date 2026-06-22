export const playerSockets = new Map<string, any>();
export const gameRooms = new Map<string, Set<any>>();
export const roomTargets = new Map<string, string[]>();
export const roomPlayers = new Map<
  string,
  Map<
    string,
    {
      playerId: string;
      guesses: { result: string[] }[][];
      currentWordIndex: number;
      startTime?: number;
      endTime?: number;
      completed?: boolean;
      score?: number;
    }
  >
>();
