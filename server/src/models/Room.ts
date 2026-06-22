import { TARGET_WORDS } from "@server/words/words-5";
import type { Player } from "./Player";

interface GetPlayerProps {
  socket?: WebSocket;
  id?: string;
}

export class Room {
  public players = new Map<string, Player>();

  public readonly id: string;
  public readonly maxPlayers: number;
  private targetWords: string[] = [];

  handleGuess() {}

  constructor(id: string, maxPlayers: number) {
    this.id = id;
    this.maxPlayers = maxPlayers;
  }

  addPlayer(player: Player) {
    this.players.set(player.id, player);
  }

  removePlayer(player: Player) {
    this.players.delete(player.id);
  }

  getPlayer({ socket, id }: GetPlayerProps) {
    if (id) return this.players.get(id);

    if (socket) {
      return Array.from(this.players.values()).find(
        (player) => player.socket === socket,
      );
    }

    return undefined;
  }

  broadcast(message: unknown) {
    for (const player of this.players.values()) {
      player.send(message);
    }
  }

  startGame() {
    this.generateWords();
    console.log(this.targetWords);
  }

  private generateWords() {
    this.targetWords = [
      TARGET_WORDS[Math.floor(Math.random() * TARGET_WORDS.length)]!,
      TARGET_WORDS[Math.floor(Math.random() * TARGET_WORDS.length)]!,
      TARGET_WORDS[Math.floor(Math.random() * TARGET_WORDS.length)]!,
    ];
  }
}
