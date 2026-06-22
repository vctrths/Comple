export function evaluateGuess(guess: string, target: string): string[] {
  const result: string[] = new Array(5);
  const targetLetters = target.split("");
  const guessLetters = guess.split("");
  const targetCounts = new Map<string, number>();

  if (guess === target) {
    result.forEach((_, i) => {
      result[i] = "correct";
    });
  }
  targetLetters.forEach((letter: string, index: number) => {
    if (letter === guessLetters[index]) {
      result[index] = "correct";
    } else {
      targetCounts.set(letter, (targetCounts.get(letter) || 0) + 1);
    }
  });

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
