import React, { useState } from "react";

export default ({ gameStatus, onStartNewGame, onJoinExistingGame }) => {
  const {
    winner,
    yourAccount,
    status,
    nextMovePlayer,
    gameId,
    player1,
    player2,
  } = gameStatus;
  const [joinGameId, setJoinGameId] = useState(null);

  const won = winner?.toLowerCase() === yourAccount?.toLowerCase();
  const loose =
    status == 1 && winner?.toLowerCase() != yourAccount?.toLowerCase();
  const tie = status == 2;
  const canMove = yourAccount?.toLowerCase() === nextMovePlayer?.toLowerCase();
  const playable = gameId > 0 && !won && !loose && !tie;
  const iCreateTheGame = player1?.toLowerCase() === yourAccount?.toLowerCase();

  console.log("game");

  const renderMessage = (condition, message) =>
    condition && <div className="message message-colored">{message}</div>;

  return (
    <div className="status-bar">
      <h1 className="title">Tic Tac Toe</h1>

      <div className="actions">
        <div className="action">
          <button className="button-new-game" onClick={() => onStartNewGame()}>
            Create New Game
          </button>
        </div>

        <div className="action">
          <button
            className="join-game-button"
            onClick={() => onJoinExistingGame(joinGameId)}
          >
            Join a Game
          </button>
          <input
            className="input-join-game"
            value={joinGameId}
            onChange={(e) => setJoinGameId(e.target.value)}
            placeholder="Game Id"
          />
        </div>
      </div>

      <div className="messages">
        {iCreateTheGame &&
          playable &&
          player2 === "0x0000000000000000000000000000000000000000" && (
            <div className="message">
              <p>
                Game created! The ID is
                <span className="game-details"> {gameId}</span>
              </p>
              <p>Give it to the other player so he can join the game.</p>
            </div>
          )}
        <div className="message">
          {playable && canMove
            ? "It's your turn"
            : playable && !canMove
            ? "Wait for your opponent's move"
            : "Create a new game or insert a Game Id and join an existing game"}
        </div>

        {won && (
          <div className="message message-colored"> *** YOU WIN *** </div>
        )}
        {loose && <div className="message message-colored"> YOU LOOSE </div>}
        {tie && (
          <div className="message message-colored"> The game is a draw... </div>
        )}
      </div>
    </div>
  );
};
