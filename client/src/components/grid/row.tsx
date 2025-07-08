import Cell from './cell'
type LetterStatus  = 'correct' | 'present' | 'absent' | undefined;

interface RowProps {
    guess: string;
    result: LetterStatus[];
}

export default function Row({ guess, result }: RowProps) {
    const letters = guess.padEnd(5).split('');
    const paddedLetters = [...letters, ...Array(5 - letters.length).fill('')];

    return(
        <div style={{display : 'flex', gap : '1rem', marginBottom : '1rem'}}>
            {paddedLetters.map((letter, i) => (
                <Cell key={i} letter = {letter} status = {result[i]} ></Cell>
            ))}
        </div>
    )
}