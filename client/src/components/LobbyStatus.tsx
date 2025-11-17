import PlayerStatus from './PlayerStatus';

type LetterStatus = 'correct' | 'present' | 'absent' | undefined;

interface Player {
  playerId: string;
  guesses: Array<Array<{ result: LetterStatus[] }>>;
  currentWordIndex?: number;
  completed?: boolean;
  score?: number;
}

interface LobbyStatusProps {
  playerList: Player[];
  currentPlayerId: string;
}

function LobbyStatus({ playerList, currentPlayerId }: LobbyStatusProps) {
  return (
    <div>
      <h4>Players in room</h4>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>
        {playerList.map(player =>
          player.playerId !== currentPlayerId ? (
            <div key={player.playerId} style={{ display: 'flex', flexDirection: 'column' }}>
              <PlayerStatus player={player} />
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
export default LobbyStatus;