import { useEffect, useState } from 'react'
import './App.css'

import WordGrid from './components/grid/WordGrid'
import InputRow from './components/grid/InputRow'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"

function App() {
  type LetterStatus  = 'correct' | 'present' | 'absent' | undefined;
  
  interface WordGuess {
    word: string;
    result: LetterStatus[];
  }
  
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<WordGuess[]>([]);
  const [gameId, setGameId] = useState<string>('');

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/new-game`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json()
      if (response.ok){
        setGameId(data.gameId)
      }
    } catch (error) {
      console.error('Failed to start new game: ', error);
    }
  }

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
      const response = await fetch(`${SERVER_URL}/api/guess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guess: guess // Send the array directly
        })

      });
      const data = await response.json();

      if (response.ok) {
        const newGuess = {
          word: data.word as string,
          result: data.result satisfies LetterStatus[]
        }

        setGuesses(prev => [...prev, newGuess]);
        setCurrentGuess([]);
      } else {
        console.log(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <WordGrid guesses = {guesses}></WordGrid>
      <InputRow letters={currentGuess} onLetterAdd={letterAdd} onLetterRemove={letterRemove} onSubmit={submitGuess}></InputRow>
    </>
  )
}

export default App
