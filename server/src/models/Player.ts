export class Player {
  public username: string;
  public readonly id: string;
  private guesses: string[] = [];
  public currentWordIndex: number = 0;
  public readonly socket: WebSocket;

  constructor(username: string, id: string, socket: WebSocket) {
    this.username = username;
    this.id = id;
    this.socket = socket;
  }

  getSocket() {
    return this.socket;
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
}
