import React from "react";
import Loading from "./Loading";

export default ({ gameStatus, handleClick }) => {
  const { winner, yourAccount, status, gameId, nextMovePlayer } = gameStatus;
  const won = winner?.toLowerCase() === yourAccount?.toLowerCase();
  const loose =
    status == 1 && winner?.toLowerCase() != yourAccount?.toLowerCase();
  const tie = status == 2;
  const canMove = yourAccount?.toLowerCase() === nextMovePlayer?.toLowerCase();
  const playable = gameId > 0 && !won && !loose && !tie;

  return (
    <div className="board">
      {gameStatus.squares.map((val, i) => (
        <button className="square" onClick={() => handleClick(i)} key={i}>
          {val === "1" ? "X" : val === "2" ? "O" : ""}
        </button>
      ))}

      {playable && !canMove && (
        <div className="board-overlay">
          <Loading />
        </div>
      )}
    </div>
  );
};
