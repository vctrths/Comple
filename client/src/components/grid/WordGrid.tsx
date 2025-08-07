import Row from './Row'

type LetterStatus  = 'correct' | 'present' | 'absent' | undefined;

interface WordGridProps {
    guesses: { word : string, result : LetterStatus[]}[];
}

export default function WordGrid({ guesses }: WordGridProps){
    return(
        <div>
            {guesses.map((guess, i) => (
                <Row key={i} guess={guess.word} result={guess.result}></Row>
            ))}
        </div>
    )
}