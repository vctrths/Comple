import Cell from './Cell'
type LetterStatus  = 'correct' | 'present' | 'absent' | undefined;

interface RowProps {
    guess: string;
    result: LetterStatus[];
    hideLetters?: boolean;
    small?: boolean;
}

export default function Row({ guess, result, hideLetters = false, small = false }: RowProps) {
    const letters = guess.padEnd(5).split('');
    const paddedLetters = [...letters, ...Array(5 - letters.length).fill('')];

    return(
        <div style={{display : 'flex', gap : small ? '.25rem' : '1rem', marginBottom : small ? '.25rem' : '1rem'}}>
            {paddedLetters.map((letter, i) => (
                <Cell key={i} letter = {hideLetters ? '' : letter} status = {result[i]} small = {small}></Cell>
            ))}
        </div>
    )
}