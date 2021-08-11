import React, { useState, useEffect } from "react";
import TicTacToeFacade from "../contracts/TicTacToeFacade";
import "../styles/app.css";
import Board from "./Board";
import StatusBar from "./StatusBar";
import Loading from "./Loading";

const address0 = "0x0000000000000000000000000000000000000000";
const address1 = "0x0000000000000000000000000000000000000001";
const lsGameKey = "tic-tac-toc-game";
const lsAppKey = "tic-tac-toc-app";

const loadAppStatus = () => {
  const strLsStatusApp = window.localStorage.getItem(lsAppKey);

  return strLsStatusApp?.length > 0
    ? JSON.parse(strLsStatusApp)
    : {
        canMove: false,
        won: false,
        loose: false,
        tie: false,
        iCreateTheGame: false,
      };
};

const loadGameStatus = () => {
  const strLsStatusGame = window.localStorage.getItem(lsGameKey);

  return strLsStatusGame?.length > 0
    ? JSON.parse(strLsStatusGame)
    : {
        squares: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        status: null,
        player1: null,
        player2: null,
        prize: 0,
        nextMoveTo: null,
        gameId: -1,
      };
};

function App() {
  const [ticTacToeFacade, setTicTacToeFacade] = useState();
  const [appStatus, setAppStatus] = useState(loadAppStatus());
  const [gameStatus, setGameStatus] = useState(loadGameStatus());
  const [loading, setLoading] = useState(false);

  const updateGameStatus = (updatedGame) => {
    window.localStorage.setItem(lsGameKey, JSON.stringify(updatedGame));
    setGameStatus(updatedGame);
  };

  useEffect(() => {
    (async () => {
      setTicTacToeFacade(
        await TicTacToeFacade(
          (updatedGame) => updateGameStatus(updatedGame),
          (updatedGame) => updateGameStatus(updatedGame),
          (updatedGame) => updateGameStatus(updatedGame)
        )
      );
    })();

    const strLsStatusGame = window.localStorage.getItem(lsGameKey);
    if (strLsStatusGame?.length > 0) {
      const lsStatusGame = JSON.parse(strLsStatusGame);
      setGameStatus(lsStatusGame);
    }

    const strLsStatusApp = window.localStorage.getItem(lsAppKey);
    if (strLsStatusApp?.length > 0) {
      const lsStatusApp = JSON.parse(strLsStatusApp);

      setAppStatus(lsStatusApp);
    }
  }, []);

  const eqAddress = (addr1, addr2) =>
    addr1 != address0 && addr1 !== address1 && addr1 === addr2;

  useEffect(() => {
    const updatedAppStatus = appStatus.iCreateTheGame
      ? {
          canMove: gameStatus.nextMoveTo === "1",
          won:
            gameStatus.gameId > 0 &&
            eqAddress(gameStatus.player1, gameStatus.status),
          loose:
            gameStatus.gameId > 0 &&
            eqAddress(gameStatus.player2, gameStatus.status),
          tie: gameStatus.gameId > 0 && gameStatus.status === address1,
          iCreateTheGame: true,
        }
      : {
          canMove: gameStatus.nextMoveTo === "2",
          won:
            gameStatus.gameId > 0 &&
            eqAddress(gameStatus.player2, gameStatus.status),
          loose:
            gameStatus.gameId > 0 &&
            eqAddress(gameStatus.player1, gameStatus.status),
          tie: gameStatus.gameId > 0 && gameStatus.status === address1,
          iCreateTheGame: false,
        };

    setAppStatus(updatedAppStatus);
    window.localStorage.setItem(lsAppKey, JSON.stringify(updatedAppStatus));
  }, [gameStatus]);

  const handleStartNewGame = async (prizeAmount) => {
    console.log("ticTacToeFacade ", ticTacToeFacade);

    setLoading(true);
    try {
      setAppStatus({
        ...appStatus,
        iCreateTheGame: true,
      });
      await ticTacToeFacade.startNewGame(prizeAmount);
    } catch (err) {
      setAppStatus({
        ...appStatus,
        iCreateTheGame: false,
      });
    }

    setLoading(false);
  };

  const handleJoinExistingGame = async (gameId, prizeAmount) => {
    setLoading(true);
    try {
      await ticTacToeFacade.joinGame(gameId, prizeAmount);
      const updatedAppState = {
        ...appStatus,
        iCreateTheGame: false,
      };
      window.localStorage.setItem(lsAppKey, JSON.stringify(updatedAppState));
      setAppStatus(updatedAppState);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  const handleMoveMade = async (cellNumber) => {
    setLoading(true);
    try {
      await ticTacToeFacade.makeMove(parseInt(gameStatus.gameId), cellNumber);
      window.localStorage.setItem(lsAppKey, JSON.stringify(appStatus));
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  console.log("gameStatus ", gameStatus);
  console.log("appStatus ", appStatus);

  return (
    <div className="app">
      <StatusBar
        appStatus={appStatus}
        gameStatus={gameStatus}
        onStartNewGame={handleStartNewGame}
        onJoinExistingGame={handleJoinExistingGame}
      />
      {gameStatus.gameId > 0 && (
        <Board squares={gameStatus.squares} handleClick={handleMoveMade} />
      )}
      {loading && <Loading />}
    </div>
  );
}

export default App;
