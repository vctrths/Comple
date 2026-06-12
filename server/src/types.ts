import type { ServerWebSocket } from "bun";
import type { WSContext } from "hono/ws";

export type GuessResponse = {
  word: string;
  result: string[];
};
export type ApiResponse = {
  message: string;
  success: boolean;
};

export type wsType = WSContext<ServerWebSocket<undefined>>;

export interface handleType {
  ws: wsType;
  event?: any;
  closeEvent?: CloseEvent;
}

export type GameMessage = {
  gameId: string;
  playerId: string;
  guess?: string;
};
