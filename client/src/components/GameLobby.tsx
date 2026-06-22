import { useState } from "react";
import Button from "./Button";
import styles from "./GameLobby.module.css";

interface GameLobbyProps {
  isConnected: boolean;
  hasJoinedRoom: boolean;
  gameId: string;
  playerId: string;
  onJoinRoom: (roomId: string) => void;
}

function GameLobby({ isConnected, gameId, onJoinRoom }: GameLobbyProps) {
  const [customRoomId, setCustomRoomId] = useState("");

  const handleJoinCustomRoom = () => {
    if (customRoomId.trim()) {
      onJoinRoom(customRoomId.trim());
    }
  };

  // const handleJoinCurrentRoom = () => {
  //   if (gameId) {
  //     onJoinRoom(gameId);
  //   }
  // };
  console.log(gameId);
  return (
    <div>
      <h1>Comple</h1>
      {isConnected ? (
        <div className={styles["card"]}>
          <div className={styles["matchmaking"]}>
            <Button label="Random room" />
            <Button label="Room list" appearance="outline" />
          </div>
          <div>
            <h4 style={{ textAlign: "start" }}>Custom room</h4>
            <div className={styles["custom"]}>
              <input
                type="text"
                placeholder="Enter Room ID"
                value={customRoomId}
                onChange={(e) => setCustomRoomId(e.target.value)}
                className={styles["roomid"]}
              />
              <Button
                label="Join"
                appearance="plain"
                onClick={handleJoinCustomRoom}
                disabled={!customRoomId.trim()}
              />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <p>Connecting to server...</p>
        </div>
      )}
    </div>
  );
}

export default GameLobby;
