import { TARGET_WORDS } from "@server/words/words-5";
import type { Player } from "./Player";
import { evaluateGuess } from "@server/services/evaluateGuess";

interface GetPlayerProps {
  socket?: WebSocket;
  id?: string;
}

export class Room {
  public players = new Map<string, Player>();

  public readonly id: string;
  public readonly maxPlayers: number;
  private targetWords: string[] = [];

  handleGuess(player: Player, guess: string) {
    const target = this.targetWords[player.currentWordIndex];
    if (!target) return undefined;
    const result = evaluateGuess(guess, target);
    player.addEvaluatedGuess(result);
    return result;
  }

  constructor(id: string, maxPlayers: number) {
    this.id = id;
    this.maxPlayers = maxPlayers;
  }

  addPlayer(player: Player) {
    this.players.set(player.id, player);
  }

  removePlayer(player: Player) {
    this.players.delete(player.id);
    return this.players.size != 0;
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

  getPlayersList() {
    return Array.from(this.players.values()).map(
      (player) => player.getPublicData(),
    );
  }

  broadcast(message: unknown, except: Player[] = []) {
    const exceptIds = new Set(except.map((player) => player.id));

    for (const player of this.players.values()) {
      if (exceptIds.has(player.id)) continue;
      player.send(message);
    }
  }

  startGame() {
    this.generateWords();
    for (const player of this.players.values()) {
      player.startGame();
    }
  }

  private generateWords() {
    this.targetWords = [
      TARGET_WORDS[Math.floor(Math.random() * TARGET_WORDS.length)]!,
      TARGET_WORDS[Math.floor(Math.random() * TARGET_WORDS.length)]!,
      TARGET_WORDS[Math.floor(Math.random() * TARGET_WORDS.length)]!,
    ];
  }
}
