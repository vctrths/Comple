interface GameStatusProps {
  hasJoinedRoom: boolean;
  gameId: string;
  playerId: string;
}

function GameStatus({ hasJoinedRoom, gameId, playerId }: GameStatusProps) {
  return (
    <>
      {hasJoinedRoom && (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'start'}}>
          <span style={{alignSelf: 'start'}}><strong>user:</strong> {playerId}</span>
          <span style={{alignSelf: 'start', marginBottom: '8px'}}><strong>room:</strong> {gameId}</span>
        </div>
      )}
    </>
  );
}

export default GameStatus;