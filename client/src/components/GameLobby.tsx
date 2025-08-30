import { useState } from 'react';

interface GameLobbyProps {
  isConnected: boolean;
  hasJoinedRoom: boolean;
  gameId: string;
  playerId: string;
  onJoinRoom: (roomId: string) => void;
}

function GameLobby({ 
  isConnected, 
  gameId, 
  onJoinRoom
}: GameLobbyProps) {
  const [customRoomId, setCustomRoomId] = useState('');

  const handleJoinCustomRoom = () => {
    if (customRoomId.trim()) {
      onJoinRoom(customRoomId.trim());
    }
  };

  const handleJoinCurrentRoom = () => {
    if (gameId) {
      onJoinRoom(gameId);
    }
  };

  return (
    <div>
      <h1>Competitive Wordle</h1>
      {isConnected ? (
        <div>
          {/* Join Custom Room */}
          <div>
            <h4 style={{textAlign: 'start'}}>Join a room!</h4>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <input type="text" placeholder="Enter Room ID" value={customRoomId} onChange={(e) => setCustomRoomId(e.target.value)} style={{width: '70%', padding: '.8rem', border: '1px black',borderRadius: '8px'}}/>
              <button onClick={handleJoinCustomRoom} disabled={!customRoomId.trim()}>Join</button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Connecting to server...</p>
        </div>
      )}
    </div>
  );
}

export default GameLobby;