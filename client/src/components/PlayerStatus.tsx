import Row from "./grid/Row";

type LetterStatus = 'correct' | 'present' | 'absent' | undefined;

interface Player {
  playerId: string;
  // guesses per word: [ wordIndex -> [ guesses -> { result: LetterStatus[] } ] ]
  guesses: Array<Array<{ result: LetterStatus[] }>>;
  currentWordIndex?: number;
  completed?: boolean;
  score?: number;
}

export default function PlayerStatus({ player }: { player: Player }) {
  return (
    <div style={{ minWidth: 120 }}>
      <div style={{ fontSize: 12, marginBottom: 6 }}>
        <strong>{player.playerId}</strong>
        {player.completed ? <span style={{ marginLeft: 8, color: '#8bc34a' }}>✓</span> : null}
        {typeof player.score === 'number' ? <span style={{ marginLeft: 8, fontSize: 11 }}>Score: {player.score}</span> : null}
      </div>

      {player.guesses.map((wordGuesses, wi) => (
        <div key={wi} style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>
            Word {wi + 1} {player.currentWordIndex === wi && !player.completed ? '(current)' : ''}
          </div>

          {wordGuesses.length === 0 ? (
            <Row key={'empty-' + wi} guess={'xxxxx'} result={Array(5).fill(undefined)} small hideLetters />
          ) : (
            wordGuesses.map((g, gi) => (
              <Row key={gi} guess={'xxxxx'} result={g.result} small hideLetters />
            ))
          )}
        </div>
      ))}
    </div>
  );
}