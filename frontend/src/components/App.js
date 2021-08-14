import React, { useState, useEffect } from "react";
import TicTacToeFacade from "../contracts/TicTacToeFacade";
import "../styles/app.css";
import Board from "./Board";
import StatusBar from "./StatusBar";
import Loading from "./Loading";
import translateAddress from "../utils/translate-layer1-address";
import getLayer2Balance from "../utils/get-balance";

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

const gameStatusUpdater = (() => {
  let fnUpdater = null;
  const setFnUpdater = (_fnUpdater) => (fnUpdater = _fnUpdater);

  setInterval(async () => {
    if (!!fnUpdater) await fnUpdater();
  }, 5000);

  return {
    setFnUpdater,
  };
})();

function App() {
  const [ticTacToeFacade, setTicTacToeFacade] = useState();
  const [gameStatus, setGameStatus] = useState(loadGameStatus());
  const [loading, setLoading] = useState(false);

  const [layer1Address, setLayer1Address] = useState();
  const [layer2Balance, setLayer2Balance] = useState();

  const updateGameStatus = (updatedGame) => {
    window.localStorage.setItem(lsGameKey, JSON.stringify(updatedGame));
    setGameStatus({
      gameStatus,
      ...updatedGame,
    });
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
      const yourAccount = await _ticTacToeFacade.getCurrentAccount();
      if (strLsStatusGame?.length > 0) {
        const lsStatusGame = JSON.parse(strLsStatusGame);
        setGameStatus({
          ...lsStatusGame,
          yourAccount,
        });
      }

      const l1Address = await translateAddress(
        _ticTacToeFacade.web3,
        yourAccount
      );

      console.log("l1Address ", l1Address);
      setLayer1Address(l1Address);

      const ethBalance = await getLayer2Balance(
        _ticTacToeFacade.web3,
        yourAccount
      );
      setLayer2Balance(ethBalance);
    })();
  }, []);

  const handleStartNewGame = async () => {
    console.log("ticTacToeFacade ", ticTacToeFacade);

    setLoading(true);
    try {
      await ticTacToeFacade.startNewGame();
    } catch (err) {
      console.log(err);
      debugger;
    }

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

  gameStatusUpdater.setFnUpdater(async () => {
    if (ticTacToeFacade && gameStatus.gameId > 0) {
      console.log("updating game ----- ", gameStatus);

      const updatedGame = await ticTacToeFacade.getGame(gameStatus.gameId);
      updateGameStatus({
        ...gameStatus, // not overwrite "yourAccount"
        ...updatedGame,
      });
    }
  });

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
      <div className="footer">
        {layer1Address && (
          <>
            <b>LAYER 1 DEPOSIT ADDRESS: </b>
            <p className="layer1-address">{layer1Address}</p>
            <div className="buttons-bridge">
              <a
                className="button-bridge-link"
                target="_blank"
                href="https://force-bridge-test.ckbapp.dev/bridge/Ethereum/Nervos?xchain-asset=0x0000000000000000000000000000000000000000"
              >
                Go to Force Bridge to transfer some ETH
              </a>
            </div>

            <p className="bridge-instructios-title">When the page loaded: </p>
            <ol className="bridge-instructions">
              <li>
                open Metamask and select <b>Rinkeby</b> network
              </li>
              <li>connect your wallet</li>
              <li>select the token you want to transfer</li>
              <li>set its quantity</li>
              <li>
                set the field <b>recipient</b> with the above{" "}
                <b>layer 1 deposit address</b>
              </li>
              <li>
                click the <b>Bridge</b> button and wait for confirmations (first
                confirmation when <b>Pending</b>, second confirmation when{" "}
                <b>Succeed</b>)
              </li>
              <li>
                done this. and... Compliments! You have transfered your tokens
                to Layer 2
              </li>
            </ol>
            <div className="spacer"> </div>
            <p className="balance">
              On Layer 2 for the SUDT-ERC20
              0xC9BD07Ecf288b65bFD7bfC2B88a84d5D0CC676b3
              <br />
              there is a balance of <b>{layer2Balance}</b>
            </p>
          </>
        )}
      </div>
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
