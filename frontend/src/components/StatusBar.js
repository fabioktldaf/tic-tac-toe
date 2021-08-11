import React, { useState } from "react";

export default ({
  appStatus,
  gameStatus,
  onStartNewGame,
  onJoinExistingGame,
}) => {
  const [joinGameId, setJoinGameId] = useState(null);
  const [joinGamePrizeAmount, setJoinGamePrizeAmount] = useState(0.001);
  const [newGamePrizeAmount, setNewGamePrizeAmount] = useState(0.001);
  const [newGameSelected, setNewGameSelected] = useState(true);

  const renderTabsHeader = () => (
    <div className="actions-header">
      <div
        className={`actions-header-item ${newGameSelected ? "active" : ""}`}
        onClick={() => setNewGameSelected(true)}
      >
        Start New Game
      </div>
      <div
        className={`actions-header-item ${!newGameSelected ? "active" : ""}`}
        onClick={() => setNewGameSelected(false)}
      >
        Join Existing Game
      </div>
    </div>
  );

  const renderTabNewGame = () =>
    newGameSelected && (
      <div className="action">
        <div className="action-text">
          Enter the prize amount you want to set for the new game
        </div>

        <div className="action-container">
          <input
            value={newGamePrizeAmount}
            className="game-button-input"
            type="text"
            onChange={(e) => setNewGamePrizeAmount(e.target.value)}
            placeholder="prize in ETH"
          />

          <button onClick={() => onStartNewGame(newGamePrizeAmount)}>
            Create New Game
          </button>
        </div>
      </div>
    );

  const renderTabJoinGame = () =>
    !newGameSelected && (
      <div className="action">
        <div className="action-text">
          Enter the game id and the prize amount to enter the game
        </div>
        <div className="action-container">
          <input
            className="game-button-input"
            type="text"
            onChange={(e) => setJoinGameId(e.target.value)}
            placeholder="game id"
          />
          <input
            className="game-button-input"
            value={joinGamePrizeAmount}
            onChange={(e) => setJoinGamePrizeAmount(e.target.value)}
            placeholder="prize in ETH"
          />
          <button
            className="join-game-button"
            onClick={() => onJoinExistingGame(joinGameId, joinGamePrizeAmount)}
          >
            Join a Game
          </button>
        </div>
      </div>
    );

  const renderActions = () => (
    <div className="game-actions">
      {renderTabsHeader()}
      {renderTabNewGame()}
      {renderTabJoinGame()}
    </div>
  );

  const renderMessage = (condition, message) =>
    condition && <div className="message message-colored">{message}</div>;

  return (
    <>
      <h1 className="title">Tic Tac Toe</h1>
      {renderActions()}
      <div className="messages">
        {appStatus.iCreateTheGame && gameStatus.gameId > 0 && (
          <div className="message">
            <p>
              The game you created has id{" "}
              <span className="game-details">{gameStatus.gameId}</span> and
              prize <span className="game-details">{newGamePrizeAmount}</span>
            </p>
            <p>Give this info to your opponent and let him join this game.</p>
          </div>
        )}
        {renderMessage(
          appStatus.canMove &&
            !appStatus.won &&
            !appStatus.loose &&
            !appStatus.tie,
          "It's your turn, click on a square"
        )}
        {renderMessage(appStatus.won, "YOU WIN!!!")}
        {renderMessage(appStatus.loose, "YOU LOOSE!!!")}
        {renderMessage(appStatus.tie, "it's a tie... try again")}
      </div>
    </>
  );
};
