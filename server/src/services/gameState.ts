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

export function evaluateGuess(guess: string, target: string): string[] {
  const result: string[] = new Array(5);
  const targetLetters = target.split("");
  const guessLetters = guess.split("");
  const targetCounts = new Map<string, number>();

  // First pass: mark correct positions and count remaining letters
  targetLetters.forEach((letter: string, index: number) => {
    if (letter === guessLetters[index]) {
      result[index] = "correct";
    } else {
      // Count this letter as available for 'present' matches
      targetCounts.set(letter, (targetCounts.get(letter) || 0) + 1);
    }
  });

  // Second pass: mark present/absent for non-correct positions
  guessLetters.forEach((letter: string, index: number) => {
    if (result[index] !== "correct") {
      const availableCount = targetCounts.get(letter) || 0;

      if (availableCount > 0) {
        result[index] = "present";
        targetCounts.set(letter, availableCount - 1);
      } else {
        result[index] = "absent";
      }
    }
  });

  return result;
}
