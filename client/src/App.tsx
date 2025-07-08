import { useState } from 'react'
import beaver from './assets/beaver.svg'
import type { ApiResponse } from 'shared'
import './App.css'

import Grid from './components/grid/WordGrid'
import WordGrid from './components/grid/WordGrid'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"

function App() {
  const [data, setData] = useState<ApiResponse | undefined>()

  async function sendRequest() {
    try {
      const req = await fetch(`${SERVER_URL}/hello`)
      const res: ApiResponse = await req.json()
      setData(res)
    } catch (error) {
      console.log(error)
    }
  }

  type LetterStatus  = 'correct' | 'present' | 'absent' | undefined;

  const guesses = [
    {word : 'apple', result : ['present', 'absent', 'correct', 'absent', 'absent'] satisfies LetterStatus[]},
    {word : 'crane', result : ['absent', 'absent', 'absent', 'absent', 'correct'] satisfies LetterStatus[]},
    {word : 'sleep', result : ['correct', 'absent', 'correct', 'present', 'correct'] satisfies LetterStatus[]},
    {word : 'undef', result : [] satisfies LetterStatus[]}
  ]

  return (
    <>
      <WordGrid guesses = {guesses}></WordGrid>
    </>
  )
}

export default App
