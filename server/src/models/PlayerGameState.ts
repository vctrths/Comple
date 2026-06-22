class PlayerGameState {
  public readonly id: string;
  public readonly startTime: number;

  private guesses: { result: string[] }[][] = [];
  private currentWordIndex: number = 0;
  private endTime?: number;
  private completed: boolean = false;
  private score: number = 0;

  public constructor(id: string) {
    this.id = id;
    this.startTime = Date.now();
  }

  public processGuess() {}
  public advance() {}
  public finish() {}

  public getScore(): number {
    return this.score;
  }
}
