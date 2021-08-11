import Web3 from "web3";
import ticTacTocJson from "./TicTacToe.json";

export const getWeb3 = () =>
  new Promise((resolve, reject) => {
    window.addEventListener("load", async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      } else if (window.web3) {
        const web3 = window.web3;
        resolve(web3);
      } else {
        const provider = new Web3.providers.HttpProvider(
          "http://127.0.0.1:7545"
        );
        const web3 = new Web3(provider);
        console.log("No web3 instance injected, using Local web3.");
        resolve(web3);
      }
    });
  });

export default async (
  onGameCreatedCallback,
  onOpponentJoinedGameCallback,
  onMoveMadeCallback
) => {
  const web3 = await getWeb3();
  const netId = await web3.eth.getChainId();
  const contractAddress = ticTacTocJson.networks[netId].address;
  const contract = new web3.eth.Contract(ticTacTocJson.abi, contractAddress);

  let currentGameId = -1;

  const options = {
    addresses: [contractAddress],
    fromBlock: "latest",
  };

  contract.events.GameCreated(options).on("data", async (event) => {
    console.log("GameCreated ", event);

    const { sender, gameId } = event.returnValues;
    if (sender === (await getCurrentAccount())) {
      const updatedGame = await getGame(gameId);
      currentGameId = gameId;

      onGameCreatedCallback({
        ...updatedGame,
        gameId,
      });
    }
  });

  contract.events.OpponentJoinedGame(options).on("data", async (event) => {
    console.log("OpponentJoinedGame ", event);

    const { sender, gameId } = event.returnValues;
    if (gameId == currentGameId) {
      const updatedGame = await getGame(gameId);

      onOpponentJoinedGameCallback({
        ...updatedGame,
        gameId,
      });
    }
  });

  contract.events.MoveMade(options).on("data", async (event) => {
    console.log("MoveMade ", event);

    const { sender, gameId } = event.returnValues;
    if (gameId == currentGameId) {
      const updatedGame = await getGame(gameId);

      onMoveMadeCallback({
        ...updatedGame,
        gameId,
      });
    }
  });

  const getCurrentAccount = async () => {
    const accounts = await web3.eth.getAccounts();
    return accounts[0];
  };

  const startNewGame = async (prizeAmount) => {
    await contract.methods.startNewGame().send({
      from: await getCurrentAccount(),
      value: web3.utils.toWei(prizeAmount.toString(), "ether"),
      gasPrice: "1000000000",
    });
  };

  const getGame = async (gameId) => {
    currentGameId = gameId;
    return await contract.methods.getGame(gameId).call();
  };

  const joinGame = async (gameId, prizeAmount) => {
    currentGameId = gameId;
    await contract.methods.joinGame(parseInt(gameId)).send({
      from: await getCurrentAccount(),
      value: web3.utils.toWei(prizeAmount.toString(), "ether"),
      gasPrice: "1000000000",
    });
  };

  const makeMove = async (gameId, move) => {
    currentGameId = gameId;
    await contract.methods.makeMove(parseInt(gameId), parseInt(move)).send({
      from: await getCurrentAccount(),
      gasPrice: "1000000000",
    });
  };

  return {
    startNewGame,
    joinGame,
    makeMove,
    getGame,
  };
};
