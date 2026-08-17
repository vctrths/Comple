import type { WebSocket } from "bun";

import { VALID_WORDS_SET, TARGET_WORDS } from "../words/words-5";
import type { GameMessage, handleType, wsType } from "@server/types";
import { Room } from "@server/models/Room";
import { Player } from "@server/models/Player";
import { rooms } from "@server/services/RoomManager";
const validWords = VALID_WORDS_SET;

export function handleOpen({ ws }: handleType) {
  console.log("WebSocket connection opened");
  ws.send(
    JSON.stringify({
      type: "connected",
      message: "Connected to game server",
    }),
  );
}

export function handleClose({ ws, closeEvent }: handleType) {
  rooms.forEach((room) => {
    const player = room.getPlayer({ socket: ws });
    if (!player) return undefined;
    room.removePlayer(player);
    console.log(` ${player?.id} left room ${room.id}`);
    if (room.players.size === 0) rooms.delete(room.id);
  });
}

function handleJoin(data: GameMessage, ws: WebSocket) {
  const { gameId, playerId, username } = data;
  const player = new Player(username ?? "Player", playerId, ws);
  console.log(`${player.id} joining game ${gameId}`);
  let room = rooms.get(gameId);
  if (!room) {
    room = new Room(gameId, 2);
    rooms.set(room.id, room);
  }
  room.addPlayer(player);
  console.log(`${player.id} succesfully joined room: ${room.id}`);
}

function handleSubmit(data: GameMessage, ws: WebSocket) {
  const { guess, playerId: guessingPlayer, gameId: currentGameId } = data;
  console.log(`${guessingPlayer} guessed: ${guess}`);

  const room = rooms.get(currentGameId);
  if (!room || !guess || !guessingPlayer) return undefined;

  const player = room.getPlayer({ id: guessingPlayer });
  if (!player) {
    return ws.send(
      JSON.stringify({
        type: "fetch-error",
        message: "couldn't fetch guessing player",
      }),
    );
  }

  if (!validWords.has(guess)) {
    return player.send({
      type: "guess-error",
      message: "Not a valid word",
    });
  }

  const result = room.handleGuess(player, guess);
  if (!result) {
    return player.send({
      type: "guess-error",
      message: "No active target word",
    });
  }

  player.send({
    type: "guess-result",
    word: guess,
    result: result,
  });
  room.broadcast(
    {
      type: "other-player-guess",
      playerId: player.id,
      result: result,
    },
    [player],
  );
  room.broadcast({
    type: "player-list",
    playerList: room.getPlayersList(),
  });
}

function handleLeave(data: GameMessage, ws: WebSocket) {
  const { playerId: leavingPlayerId, gameId: currentGameId } = data;
  const leaveRoom = rooms.get(currentGameId);
  if (!leaveRoom) return undefined;
  const playerWs = leaveRoom.getPlayer({ id: leavingPlayerId });
  if (!playerWs) return undefined;

  leaveRoom.broadcast(`Removing player ${leavingPlayerId} from room ${leaveRoom.id}`);
  const users = leaveRoom.removePlayer(playerWs);
  if (!users) {
    rooms.delete(leaveRoom.id);
  }
}

export function handleMessage({ ws, event }: handleType) {
  const data = JSON.parse(event.data as string);
  switch (data.type) {
    case "join-game":
      handleJoin(data, ws);
      break;
    case "submit-guess":
      handleSubmit(data, ws);
      break;
    case "leave-room":
      handleLeave(data, ws);
      break;
  }
}
