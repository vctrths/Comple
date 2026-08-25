export class Player {
  public username: string;
  public readonly id: string;
  private guesses: string[][] = [];
  public currentWordIndex: number = 0;
  public readonly socket: WebSocket;
  public score: number = 0;

  public startTime?: number;
  private endTime?: number;
  private completed?: boolean;

  constructor(username: string, id: string, socket: WebSocket) {
    this.username = username;
    this.id = id;
    this.socket = socket;
  }

  getSocket() {
    return this.socket;
  }

  addEvaluatedGuess(result: string[]) {
    if (result.every((eva) => eva === "correct")) {
      this.currentWordIndex += 1;

      if (this.currentWordIndex >= 3) {
        this.send({
          type: "player-finished",
          playerId: this.id,
          score: this.score,
        });
      }
    }
    this.guesses.push(result);
  }

  send(message: unknown) {
    this.socket.send(JSON.stringify(message));
  }

  getPublicData() {
    return {
      id: this.id,
      username: this.username,
    };
  }

  toRosterEntry() {
    return {
      id: this.id,
      completed: this.completed,
    }
  }

  startGame() {
    this.startTime = Date.now();
    this.completed = false;
  }
}
