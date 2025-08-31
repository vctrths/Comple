import PlayerStatus from './PlayerStatus';

type LetterStatus  = 'correct' | 'present' | 'absent' | undefined;

interface Player {
    playerId: string;
    guesses: { result: LetterStatus[]; }[];
}

interface LobbyStatusProps {
  playerList: Player[];
  currentPlayerId: string;
}

function LobbyStatus({playerList, currentPlayerId} : LobbyStatusProps) {

    // console.log(playerList);
    return (
        <div>
            <h4>Players in room</h4>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between'
            }}>
                {playerList.map(player => 
                    player.playerId !== currentPlayerId ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <p style={{fontSize: '12px'}}><b>{player.playerId}</b></p>
                            <PlayerStatus key={player.playerId} player={player}/>
                        </div>
                    ) : null
                )}
            </div>
        </div>
    )
}
export default LobbyStatus;