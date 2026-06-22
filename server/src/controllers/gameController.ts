import type { ServerWebSocket, WebSocket } from "bun";
import {
  playerSockets,
  gameRooms,
  roomTargets,
  roomPlayers,
  evaluateGuess,
} from "../services/gameState";

import { VALID_WORDS_SET, TARGET_WORDS } from "../words/words-5";
import type { WSContext, WSMessageReceive } from "hono/ws";
import type { GameMessage, handleType, wsType } from "@server/types";
import { Room } from "@server/models/Room";
import { Player } from "@server/models/Player";
const validWords = VALID_WORDS_SET;

const rooms = new Map<string, Room>();

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

  if (validWords.has(guess)) {
    const targets = roomTargets.get(currentGameId) || [];
    const playersMap = roomPlayers.get(currentGameId);
    const playerData = playersMap?.get(guessingPlayer);
    const currentWordIndex = playerData?.currentWordIndex ?? 0;
    const target = targets[currentWordIndex] ?? targets[0] ?? "";
    const result = evaluateGuess(guess, target);
    const isCorrect = guess === target;
    if (playerData) {
      if (!playerData.guesses[currentWordIndex]) {
        playerData.guesses[currentWordIndex] = [];
      }
      playerData.guesses[currentWordIndex].push({ result });
      if (isCorrect) {
        if (currentWordIndex < 3) {
          playerData.currentWordIndex += 1;
        } else {
          ws.send(
            JSON.stringify({
              type: "player-finished",
              playerId: guessingPlayer,
              score: playerData.score,
            }),
          );
        }
      }
    }

    ws.send(
      JSON.stringify({
        type: "guess-result",
        playerId: guessingPlayer,
        word: guess,
        result: result,
        isCorrect: isCorrect,
      }),
    );

    const gameRoom = gameRooms.get(currentGameId);
    gameRoom?.forEach((playerWs) => {
      if (playerWs !== ws) {
        playerWs.send(
          JSON.stringify({
            type: "other-player-guess",
            playerId: guessingPlayer,
            result: result,
          }),
        );
      }
    });
  } else {
    ws.send(
      JSON.stringify({
        type: "guess-error",
        message: "Not a valid word",
      }),
    );
  }

  const guessPlayerList = Array.from(
    roomPlayers.get(currentGameId)?.values() || [],
  );
  gameRooms.get(currentGameId)?.forEach((playerWs) => {
    playerWs.send(
      JSON.stringify({
        type: "player-list",
        playerList: guessPlayerList,
      }),
    );
  });
}

function handleLeave(data: GameMessage, ws: WebSocket) {
  console.log("Server received leave-room message:", data);
  const { gameId: leaveGameId, playerId: leavingPlayerId } = data;
  const leaveRoom = gameRooms.get(leaveGameId);
  const playerWs = playerSockets.get(leavingPlayerId);

  if (leaveRoom && playerWs && leaveRoom.has(playerWs)) {
    console.log(`Removing player ${leavingPlayerId} from room ${leaveGameId}`);
    leaveRoom.delete(playerWs);
    playerSockets.delete(leavingPlayerId);
    roomPlayers.get(leaveGameId)?.delete(leavingPlayerId);

    const playerList = Array.from(roomPlayers.get(leaveGameId)?.values() || []);
    leaveRoom.forEach((remainingPlayerWs) => {
      remainingPlayerWs.send(
        JSON.stringify({
          type: "player-list",
          playerList,
        }),
      );
    });
    if (leaveRoom.size === 0) {
      gameRooms.delete(leaveGameId);
      roomTargets.delete(leaveGameId);
    }
  } else {
    console.log("Failed checks:", {
      roomExists: !!leaveRoom,
      playerSocketFound: !!playerWs,
      wsInRoom: leaveRoom?.has(playerWs),
    });
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
