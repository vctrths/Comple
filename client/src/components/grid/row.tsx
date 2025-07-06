import Cell from './cell'
type LetterStatus  = 'correct' | 'present' | 'absent' | undefined;

interface RowProps {
    guess: string;
    result: LetterStatus[];
}

export default function Row({ guess, result }: RowProps) {
    const letters = guess.padEnd(5).split('');

    return(
        <div style={{display : 'flex', gap : '1rem', marginBottom : '1rem'}}>
            {letters.map((letter, i) => (
                <Cell letter = {letter} status = {result[i]} ></Cell>
            ))}
        </div>
    )
}