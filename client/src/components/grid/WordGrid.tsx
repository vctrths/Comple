import Row from './row'

interface WordGridProps {
    guesses: Array<string>;
}

export default function WordGrid({ guesses }: WordGridProps){
    return(
        <div>
            {guesses.map((guess, i) => (
                <Row guess = {guess}></Row>
            ))}
        </div>
    )
}