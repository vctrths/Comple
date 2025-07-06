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
  const guesses = ['apple', 'crane', 'sleep']
  return (
    <>
      <WordGrid guesses = {guesses}></WordGrid>
    </>
  )
}

export default App
