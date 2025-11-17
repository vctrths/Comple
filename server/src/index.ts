import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createBunWebSocket } from 'hono/bun';
import type { ServerWebSocket } from 'bun';

import { VALID_WORDS_SET, TARGET_WORDS } from './words/words-5'
import type{ GuessResponse, ApiResponse } from './types';
import type { WebSocket } from 'bun';
import { ScrollTrigger } from 'gsap/all';


const validWords = VALID_WORDS_SET;
let targetWord: string;
const playerSockets = new Map<string, WebSocket>();
const gameRooms = new Map<string, Set<WebSocket>>();
const roomTargets = new Map<string, string[]>();
const roomPlayers = new Map<string, Map<string, { playerId: string; guesses: { result: string[] }[][]; currentWordIndex: number; }>>();

const app = new Hono()
const { upgradeWebSocket, websocket} = createBunWebSocket<ServerWebSocket>();

app.use(cors());

app.get('/', (c) => {
  console.log('HTTP request to root');
  return c.text('Server running with WebSocket support');
});

function evaluateGuess(guess: string, target: string): string[] {
  const result: string[] = new Array(5);
  const targetLetters = target.split('');
  const guessLetters = guess.split('');
  const targetCounts = new Map<string, number>();
  
  // First pass: mark correct positions and count remaining letters
  targetLetters.forEach((letter: string , index: number) => {
    if (letter === guessLetters[index]) {
      result[index] = 'correct';
    } else {
      // Count this letter as available for 'present' matches
      targetCounts.set(letter, (targetCounts.get(letter) || 0) + 1);
    }
  });
  
  // Second pass: mark present/absent for non-correct positions
  guessLetters.forEach((letter: string , index: number) => {
    if (result[index] !== 'correct'){
      const availableCount = targetCounts.get(letter) || 0;

      if (availableCount > 0) {
        result[index] = 'present';
        targetCounts.set(letter, availableCount - 1);
      } else {
        result[index] = 'absent';
      }
    };
  });
  
  return result;
};

app.get('/ws', upgradeWebSocket((c) => {
    return {
      onOpen(event, ws) {
        console.log('WebSocket connection opened');
        ws.send(JSON.stringify({
          type: 'connected',
          message: 'Connected to game server'
        }));
      },
      onMessage(event, ws) {
        const data = JSON.parse(event.data as string);
        console.log(`Message from client: ${event.data}`);

        switch (data.type) {
          case 'join-game':
            const { gameId, playerId } = data;
            console.log(`${playerId} joining game ${gameId}`);

          playerSockets.set(playerId, ws);

            if(!gameRooms.has(gameId)) {
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
              roomPlayers.get(gameId)?.set(playerId, { playerId, guesses: [], currentWordIndex: 0});
            }

            const joinPlayerList = Array.from(roomPlayers.get(gameId)?.values() || []);
            gameRooms.get(gameId)?.forEach(playerWs => {
              playerWs.send(JSON.stringify({
                type: 'player-list',
                playerList: joinPlayerList
              }));
            });
            break;

          case 'submit-guess':
            const { guess, playerId: guessingPlayer, gameId: currentGameId } = data;
            console.log(`${guessingPlayer} guessed: ${guess}`);

            if (validWords.has(guess)) {
              const targets = roomTargets.get(currentGameId) || [];
              const playersMap = roomPlayers.get(currentGameId);
              const playerData = playersMap?.get(guessingPlayer);
              const currentWordIndex = playerData?.currentWordIndex ?? 0;
              const target = targets[currentWordIndex] ?? targets[0] ?? '';
              const result = evaluateGuess(guess, target);
              const isCorrect = guess === target;
              if (playerData) {
                if (!playerData.guesses[currentWordIndex]) {
                  playerData.guesses[currentWordIndex] = [];
                }
                playerData.guesses[currentWordIndex].push({ result });
                if(isCorrect) {
                  if(currentWordIndex < 3){
                    playerData.currentWordIndex += 1;
                  }
                  else {
                    ws.send(JSON.stringify({
                      type:'player-finished',
                      playerId: guessingPlayer,
                      score: playerData.score
                    }));
                  }
                }
              }

              ws.send(JSON.stringify({
                type: 'guess-result',
                playerId: guessingPlayer,
                word: guess,
                result: result,
                isCorrect: isCorrect
              }));

              const gameRoom = gameRooms.get(currentGameId);
              gameRoom?.forEach(playerWs => {
                if(playerWs !== ws) {
                  playerWs.send(JSON.stringify({
                    type: 'other-player-guess',
                    playerId: guessingPlayer,
                    result: result
                  }));
                }
              });
            } else {
              ws.send(JSON.stringify({
                type: 'guess-error',
                message: 'Not a valid word'
              }));
            }

            const guessPlayerList = Array.from(roomPlayers.get(currentGameId)?.values() || []);
            gameRooms.get(currentGameId)?.forEach(playerWs => {
              playerWs.send(JSON.stringify({
                type: 'player-list',
                playerList: guessPlayerList
              }));
            });
            break;

          case 'leave-room':
            console.log('Server received leave-room message:', data);
            const {gameId: leaveGameId, playerId: leavingPlayerId} = data;
            const leaveRoom = gameRooms.get(leaveGameId);
            const playerWs = playerSockets.get(leavingPlayerId);

            if(leaveRoom && playerWs && leaveRoom.has(playerWs)) {
              console.log(`Removing player ${leavingPlayerId} from room ${leaveGameId}`);
              leaveRoom.delete(playerWs);
              playerSockets.delete(leavingPlayerId);
              roomPlayers.get(leaveGameId)?.delete(leavingPlayerId);

              const playerList = Array.from(roomPlayers.get(leaveGameId)?.values() || []);
              leaveRoom.forEach(remainingPlayerWs => {
                remainingPlayerWs.send(JSON.stringify({
                  type: 'player-list',
                  playerList
                }));
              });
              if(leaveRoom.size === 0){
                gameRooms.delete(leaveGameId);
                roomTargets.delete(leaveGameId);
              }
            } else {
              console.log('Failed checks:', {
                roomExists: !!leaveRoom,
                playerSocketFound: !!playerWs,
                wsInRoom: leaveRoom?.has(playerWs)
              });
            }
            break;
        }
      },
      onClose: (event, ws) => {
        console.log('Connection closed');

        gameRooms.forEach((room, gameId) => {
          if (room.has(ws)){
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
              room.forEach(playerWs => {
                playerWs.send(JSON.stringify({
                  type: 'player-list',
                  playerList
                }));
              });
            if(room.size === 0) {
              gameRooms.delete(gameId);
              roomTargets.delete(gameId);
              console.log(`Empty game room ${gameId} deleted`);
            }
          }
        })
      }
    }
  })
);

function getPlayerList(gameId: string) {
  const playersInRoom = roomPlayers.get(gameId);
  return Array.from(playersInRoom?.values() || []);
}

// export default app;
export default {
  port: 3000,
  fetch: app.fetch,
  websocket
}