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
const validWords = VALID_WORDS_SET;

export function handleMessage(
  ws: WSContext<ServerWebSocket<undefined>>,
  data: any,
) {
  switch (data.type) {
    case "join-game":
      const { gameId, playerId } = data;
      console.log(`${playerId} joining game ${gameId}`);

      playerSockets.set(playerId, ws);

      if (!gameRooms.has(gameId)) {
        gameRooms.set(gameId, new Set<WebSocket>());
        const words: string[] = [
          TARGET_WORDS[Math.floor(Math.random() * TARGET_WORDS.length)]!,
          TARGET_WORDS[Math.floor(Math.random() * TARGET_WORDS.length)]!,
          TARGET_WORDS[Math.floor(Math.random() * TARGET_WORDS.length)]!,
        ];
        roomTargets.set(gameId, words);
        console.log(roomTargets);
      }
      gameRooms.get(gameId)?.add(ws);

      if (!roomPlayers.has(gameId)) {
        roomPlayers.set(gameId, new Map());
      }

      if (!roomPlayers.get(gameId)?.has(playerId)) {
        roomPlayers
          .get(gameId)
          ?.set(playerId, { playerId, guesses: [], currentWordIndex: 0 });
      }

      const joinPlayerList = Array.from(
        roomPlayers.get(gameId)?.values() || [],
      );
      gameRooms.get(gameId)?.forEach((playerWs) => {
        playerWs.send(
          JSON.stringify({
            type: "player-list",
            playerList: joinPlayerList,
          }),
        );
      });
      break;

    case "submit-guess":
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
      break;

    case "leave-room":
      console.log("Server received leave-room message:", data);
      const { gameId: leaveGameId, playerId: leavingPlayerId } = data;
      const leaveRoom = gameRooms.get(leaveGameId);
      const playerWs = playerSockets.get(leavingPlayerId);

      if (leaveRoom && playerWs && leaveRoom.has(playerWs)) {
        console.log(
          `Removing player ${leavingPlayerId} from room ${leaveGameId}`,
        );
        leaveRoom.delete(playerWs);
        playerSockets.delete(leavingPlayerId);
        roomPlayers.get(leaveGameId)?.delete(leavingPlayerId);

        const playerList = Array.from(
          roomPlayers.get(leaveGameId)?.values() || [],
        );
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
      break;
  }
}

export function handleClose(
  ws: WSContext<ServerWebSocket<undefined>>,
  event: CloseEvent,
) {
  gameRooms.forEach((room, gameId) => {
    if (room.has(ws)) {
      room.delete(ws);
      console.log(`Player left game ${gameId}`);
      for (const [playerId, playerWs] of playerSockets.entries()) {
        if (playerWs === ws) {
          roomPlayers.get(gameId)?.delete(playerId);
          playerSockets.delete(playerId);
          break;
        }
      }
      const playerList = Array.from(roomPlayers.get(gameId)?.values() || []);
      room.forEach((playerWs) => {
        playerWs.send(
          JSON.stringify({
            type: "player-list",
            playerList,
          }),
        );
      });
      if (room.size === 0) {
        gameRooms.delete(gameId);
        roomTargets.delete(gameId);
        console.log(`Empty game room ${gameId} deleted`);
      }
    }
  });
}
