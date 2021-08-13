import Web3 from "web3";
import { PolyjuiceHttpProvider } from "@polyjuice-provider/web3";

import ticTacTocJson from "./TicTacToe.json";

export const CONFIG = {
  WEB3_PROVIDER_URL: "https://godwoken-testnet-web3-rpc.ckbapp.dev",
  ROLLUP_TYPE_HASH:
    "0x4cc2e6526204ae6a2e8fcf12f7ad472f41a1606d5b9624beebd215d780809f6a",
  ETH_ACCOUNT_LOCK_CODE_HASH:
    "0xdeec13a7b8e100579541384ccaf4b5223733e4a5483c3aec95ddc4c1d5ea5b22",
};

const DEFAULT_SEND_OPTIONS = {
  gas: 6000000,
};

export const getWeb3 = () => {
  const godwokenRpcUrl = CONFIG.WEB3_PROVIDER_URL;
  const providerConfig = {
    rollupTypeHash: CONFIG.ROLLUP_TYPE_HASH,
    ethAccountLockCodeHash: CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
    web3Url: godwokenRpcUrl,
  };
  const provider = new PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);
  return new Web3(provider);
};
export default async (
  onGameCreatedCallback,
  onOpponentJoinedGameCallback,
  onMoveMadeCallback,
  onAccountChanged,
  onNetworkChanged
) => {
  const web3 = await getWeb3();
  const netId = await web3.eth.getChainId();
  const contractAddress = ticTacTocJson.networks[netId].address;
  const contract = new web3.eth.Contract(ticTacTocJson.abi, contractAddress);

  const startNewGame = async () => {
    const receipt = await contract.methods.startNewGame().send({
      ...DEFAULT_SEND_OPTIONS,
      from: window.ethereum.selectedAddress,
    });

    const { sender, gameId } = receipt.events.GameCreated.returnValues;
    const updatedGame = await getGame(gameId);

    onGameCreatedCallback({
      ...updatedGame,
      gameId,
      yourAccount: sender,
    });
  };

  const getGame = async (gameId) => {
    return await contract.methods.getGame(gameId).call();
  };

  const joinGame = async (gameId) => {
    const receipt = await contract.methods.joinGame(parseInt(gameId)).send({
      ...DEFAULT_SEND_OPTIONS,
      from: window.ethereum.selectedAddress,
    });

    const { sender } = receipt.events.OpponentJoinedGame.returnValues;

    const updatedGame = await getGame(gameId);

    onOpponentJoinedGameCallback({
      ...updatedGame,
      gameId,
      yourAccount: sender,
    });
  };

  const makeMove = async (gameId, move) => {
    const receipt = await contract.methods
      .makeMove(parseInt(gameId), parseInt(move))
      .send({
        ...DEFAULT_SEND_OPTIONS,
        from: window.ethereum.selectedAddress,
      });

    const { sender } = receipt.events.MoveMade.returnValues;
    const updatedGame = await getGame(gameId);

    onMoveMadeCallback({
      ...updatedGame,
      gameId,
      yourAccount: sender,
    });
  };

  window.ethereum.on(
    "accountsChanged",
    (accounts) => onAccountChanged && onAccountChanged(accounts[0])
  );

  window.ethereum.on(
    "networkChanged",
    (networkId) => onNetworkChanged && onNetworkChanged(networkId)
  );

  const getCurrentAccount = () => window.ethereum.selectedAddress;

  return {
    startNewGame,
    joinGame,
    makeMove,
    getGame,
    getCurrentAccount,
  };
};
