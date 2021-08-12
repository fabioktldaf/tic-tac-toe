import React, { useState, useEffect } from "react";
import TicTacToeFacade from "../contracts/TicTacToeFacade";
import "../styles/app.css";
import Board from "./Board";
import StatusBar from "./StatusBar";
import Loading from "./Loading";

const address0 = "0x0000000000000000000000000000000000000000";
const lsGameKey = "tic-tac-toc-game";

const loadGameStatus = () => {
  const strLsStatusGame = window.localStorage.getItem(lsGameKey);

  return strLsStatusGame?.length > 0
    ? JSON.parse(strLsStatusGame)
    : {
        squares: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        player1: address0,
        player2: address0,
        nextMovePlayer: address0,
        winner: address0,
        status: -1,
        gameId: -1,
      };
};

function App() {
  const [ticTacToeFacade, setTicTacToeFacade] = useState();
  const [gameStatus, setGameStatus] = useState(loadGameStatus());
  const [loading, setLoading] = useState(false);

  const updateGameStatus = (updatedGame) => {
    window.localStorage.setItem(lsGameKey, JSON.stringify(updatedGame));
    setGameStatus(updatedGame);
  };

  const handleAccountChanged = (newAccount) => {
    console.log("new account: ", newAccount);
    updateGameStatus({
      ...gameStatus,
      yourAccount: newAccount,
    });
  };

  useEffect(() => {
    (async () => {
      const _ticTacToeFacade = await TicTacToeFacade(
        (updatedGame) => updateGameStatus(updatedGame),
        (updatedGame) => updateGameStatus(updatedGame),
        (updatedGame) => updateGameStatus(updatedGame),
        handleAccountChanged
      );

      setTicTacToeFacade(_ticTacToeFacade);

      const strLsStatusGame = window.localStorage.getItem(lsGameKey);

      if (strLsStatusGame?.length > 0) {
        const lsStatusGame = JSON.parse(strLsStatusGame);
        setGameStatus({
          ...lsStatusGame,
          yourAccount: await _ticTacToeFacade.getCurrentAccount(),
        });
      }
    })();
  }, []);

  const handleStartNewGame = async () => {
    console.log("ticTacToeFacade ", ticTacToeFacade);

    setLoading(true);
    try {
      await ticTacToeFacade.startNewGame();
    } catch (err) {}

    setLoading(false);
  };

  const handleJoinExistingGame = async (gameId) => {
    setLoading(true);
    try {
      await ticTacToeFacade.joinGame(gameId);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  const handleMoveMade = async (cellNumber) => {
    setLoading(true);
    try {
      await ticTacToeFacade.makeMove(parseInt(gameStatus.gameId), cellNumber);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  console.log("gameStatus ", gameStatus);

  return (
    <div className="app">
      <StatusBar
        gameStatus={gameStatus}
        onStartNewGame={handleStartNewGame}
        onJoinExistingGame={handleJoinExistingGame}
      />
      {gameStatus.gameId > 0 && (
        <Board gameStatus={gameStatus} handleClick={handleMoveMade} />
      )}
      {loading && (
        <div className="waiting-overlay">
          <div className="waiting-overlay-inner">
            <Loading />{" "}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
