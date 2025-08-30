import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createBunWebSocket } from 'hono/bun';
import type { ServerWebSocket } from 'bun';

import { VALID_WORDS_SET, TARGET_WORDS } from './words/words-5'
import type{ GuessResponse, ApiResponse } from './types';
import type { WebSocket } from 'bun';


const validWords = VALID_WORDS_SET;
let targetWord: string;
const gameRooms = new Map<string, Set<WebSocket>>();
const roomTargets = new Map<string, string>();

const app = new Hono()
const { upgradeWebSocket, websocket} = createBunWebSocket<ServerWebSocket>();

app.use(cors());

app.get('/', (c) => {
  console.log('HTTP request to root');
  return c.text('Server running with WebSocket support'); // ✅ Return response
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
      onOpen() {
        console.log('WebSocket connection opened');
      },
      onMessage(event, ws) {
        const data = JSON.parse(event.data as string);
        console.log(`Message from client: ${event.data}`);
        ws.send(JSON.stringify({ message: 'Hello from server!' }));

        switch (data.type) {
          case 'join-game':
            const { gameId, playerId, username } = data;
            console.log(`${username} joining game ${gameId}`);

            if(!gameRooms.has(gameId)) {
              gameRooms.set(gameId, new Set<WebSocket>());
              roomTargets.set(gameId, TARGET_WORDS[Math.floor(Math.random() * TARGET_WORDS.length)] || 'house');
            }
            gameRooms.get(gameId)?.add(ws);

            const gameRoom = gameRooms.get(gameId);
            gameRoom?.forEach(playerWs => {
              playerWs.send(JSON.stringify({
                type: 'player-joined',
                playerId,
                username,
                playerCount: gameRoom.size
              }));
            });
          break;

          case 'submit-guess':
            const { guess, playerId: guessingPlayer, gameId: currentGameId } = data;
            console.log(`${guessingPlayer} guessed: ${guess}`);

            if (validWords.has(guess)) {
              const target = roomTargets.get(currentGameId);
              const result = evaluateGuess(guess, target);

              ws.send(JSON.stringify({
                type: 'guess-result',
                playerId: guessingPlayer,
                word: guess,
                result: result,
                isCorrect: guess === target
              }));
            } else {
              ws.send(JSON.stringify({
                type: 'guess-error',
                message: 'Not a valid word'
              }));
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

// export default app;
export default {
  port: 3000,
  fetch: app.fetch,
  websocket
}