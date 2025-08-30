import { useEffect, useState } from 'react'
import './App.css'

import WordGrid from './components/grid/WordGrid'
import InputRow from './components/grid/InputRow'
import GameLobby from './components/GameLobby'
import GameStatus from './components/GameStatus'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
const WS_URL = import.meta.env.VITE_WS_URL || SERVER_URL.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws';

function App() {
  type LetterStatus  = 'correct' | 'present' | 'absent' | undefined;
  
  interface WordGuess {
    word: string;
    result: LetterStatus[];
  }
  
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<WordGuess[]>([]);
  const [gameId, setGameId] = useState<string>('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [playerId] = useState(() => `player_${Math.random().toString(36).substring(2, 9)}`);
  const [isConnected, setIsConnected] = useState(false); 
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [playerCount, setPlayerCount] = useState<number>(0); 
  
  useEffect(() => {
    let websocket: WebSocket | null = null;

    const connectWithDelay = () => {
      setTimeout(() => {
        websocket = new WebSocket(WS_URL);
  
        websocket.onopen = () => {
          console.log('Client: Connected to WebSocket');
          setWs(websocket);
          setIsConnected(true);
        };
        websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Received:', data);
            
            switch (data.type) {
              case 'connected':
                console.log('Succesfull connected');
                break;
              case 'player-joined':
                console.log(`Player ${data.username} joined the game`);
                // Check if this is the current player joining
                if (data.playerId === playerId) {
                  setHasJoinedRoom(true);
                }
                setPlayerCount(data.playerCount || 1);
                break;
              case 'guess-result':
                const newGuess: WordGuess = {
                  word: data.word,
                  result: data.result as LetterStatus[]
                };
                setGuesses(prev => [...prev, newGuess]);
                setCurrentGuess([]);
                break;
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        websocket.onerror = (error) => {
          console.error('WebSocket error:', error)
        };
        websocket.onclose = () => {
          console.log('WebSocket closed');
          setIsConnected(false);
          setHasJoinedRoom(false);
        };
      }, 100)
    };

    connectWithDelay();

    return () => {
      if (websocket) {
        websocket.close();
      }
    }
  }, []);

  const handleJoinRoom = (roomId: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      setGameId(roomId);
      ws.send(JSON.stringify({
        type: 'join-game',
        gameId: roomId,
        playerId,
        username: `Player${playerId.substring(0, 4)}`
      }));
      console.log(`Joining room: ${roomId}`);
    } else {
      console.error('WebSocket not connected');
    }
  };

  const letterAdd = (letter: string) => {
    setCurrentGuess(prev => prev.length < 5 ? [...prev, letter] : prev);
  }
  const letterRemove = () => {
    setCurrentGuess(prev => prev.slice(0, -1));
  }
  const submitGuess = async () => {
    if(guesses.length > 6) return;
    const guess = currentGuess.join('').toLowerCase();
    if(guess.length !== 5) return;
    try {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'submit-guess',
          guess: guess,
          playerId: playerId,
          gameId: gameId
        }));
      } else {
        console.error('WebSocket not connected');
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      {!hasJoinedRoom ? (
        <GameLobby
          isConnected={isConnected}
          hasJoinedRoom={hasJoinedRoom}
          gameId={gameId}
          playerId={playerId}
          onJoinRoom={handleJoinRoom}
        />
      ) : (
        <>
          <GameStatus hasJoinedRoom={hasJoinedRoom} gameId={gameId} playerId={playerId} />
          <WordGrid guesses={guesses} />
          <InputRow letters={currentGuess} onLetterAdd={letterAdd} onLetterRemove={letterRemove} onSubmit={submitGuess} />
        </>
      )}
    </>
  )
}

export default App
