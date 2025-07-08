import { useState } from 'react'
import './App.css'

import WordGrid from './components/grid/WordGrid'
import InputRow from './components/grid/InputRow'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"

function App() {
  type LetterStatus  = 'correct' | 'present' | 'absent' | undefined;
  
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [guesses, setGuesses] = useState([
    {word : 'apple', result : ['present', 'absent', 'correct', 'absent', 'absent'] satisfies LetterStatus[]},
    {word : 'crane', result : ['absent', 'absent', 'absent', 'absent', 'correct'] satisfies LetterStatus[]},
    {word : 'sleep', result : ['correct', 'absent', 'correct', 'present', 'correct'] satisfies LetterStatus[]},
    {word : 'undef', result : [] satisfies LetterStatus[]}
  ]);

  const letterAdd = (letter: string) => {
    setCurrentGuess(prev => prev.length < 5 ? [...prev, letter] : prev);
  }
  const letterRemove = () => {
    setCurrentGuess(prev => prev.slice(0, -1));
  }

  return (
    <>
      <WordGrid guesses = {guesses}></WordGrid>
      <InputRow letters={currentGuess} onLetterAdd={letterAdd} onLetterRemove={letterRemove}></InputRow>
    </>
  )
}

export default App
