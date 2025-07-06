import Cell from './cell'

interface RowProps {
    guess: string;
}

export default function Row({ guess }: RowProps) {
    const letters = guess.padEnd(5).split('');

    return(
        <div style={{display : 'flex', gap : '1rem', marginBottom : '1rem'}}>
            {letters.map((letter, i) => (
                <Cell letter = {letter} status='correct'></Cell>
            ))}
        </div>
    )
}