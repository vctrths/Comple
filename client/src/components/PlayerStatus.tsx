import Row from "./grid/Row";

function PlayerStatus(player){
    return (
        <div>
            {console.log(player.player.guesses)}
            {player.player.guesses.map((guess, index: number) =>
                <Row key={index} guess='xxxxx' result={guess.result} small={true} hideLetters={true}></Row>
            )}
        </div>
    )
}

export default PlayerStatus