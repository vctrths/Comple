import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createBunWebSocket } from 'hono/bun';
import type { ServerWebSocket } from 'bun';

import { VALID_WORDS_SET, TARGET_WORDS } from './words/words-5'
import type{ GuessResponse, ApiResponse } from './types';
import type { WebSocket } from 'bun';


const validWords = VALID_WORDS_SET;
// let targetWord: string = TARGET_WORDS[Math.floor(Math.random()*TARGET_WORDS.length)] || 'house';
let targetWord: string;
// const targetWord = 'house';
// console.log(targetWord);


const app = new Hono()
const { upgradeWebSocket, websocket} = createBunWebSocket<ServerWebSocket>();
const server = Bun.serve({
  fetch: app.fetch,
  port: 3000,
  websocket,
});

app.use(cors());

app.get('/', (c) => {
  console.log('HTTP request to root');
  return c.text('Server running with WebSocket support'); // ✅ Return response
});

app.post('/api/guess', async (c) => {
  const body = await c.req.json();
  const guess: string = body.guess;

  if(validWords.has(guess)){
    const result = evaluateGuess(guess, targetWord);

    const api_response : GuessResponse = {
      word : guess,
      result : result
    };
    return c.json(api_response, {status: 200});
  }
  else {
    const api_response : ApiResponse = {
      message: 'Not a valid word',
      success: false
    }
    return c.json(api_response, {status: 400});
  }
});

app.post('/api/new-game', async(c) => {
  targetWord = TARGET_WORDS[Math.floor(Math.random()*TARGET_WORDS.length)] || 'house';
  const gameId: string = Math.random().toString(36).substring(2, 15);
  return c.json({ gameId, message: 'New game started'}, { status: 200});
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

app.get(
  '/ws',
  upgradeWebSocket((c) => {
    return {
      onMessage(event, ws) {
        console.log('Message from client: ${event.date');
        ws.send('Hello from server!');
      },
      onClose: () => {
        console.log('Connection closed');
      }
    }
  })
);

export default app;