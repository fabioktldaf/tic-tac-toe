const { existsSync } = require("fs");
const Web3 = require("web3");
const {
  PolyjuiceHttpProvider,
  PolyjuiceAccounts,
} = require("@polyjuice-provider/web3");

const compiledContractArtifact = require("./build/contracts/TicTacToe.json");

const DEPLOYER_PRIVATE_KEY =
  "a1c428a6141eb16c6890765236c0e5c98d8adf1a79f94899cf7dc0ed2c47a303"; // Replace this with your Ethereum private key with funds on Layer 2.

const GODWOKEN_RPC_URL = "http://godwoken-testnet-web3-rpc.ckbapp.dev";
const polyjuiceConfig = {
  rollupTypeHash:
    "0x4cc2e6526204ae6a2e8fcf12f7ad472f41a1606d5b9624beebd215d780809f6a",
  ethAccountLockCodeHash:
    "0xdeec13a7b8e100579541384ccaf4b5223733e4a5483c3aec95ddc4c1d5ea5b22",
  web3Url: GODWOKEN_RPC_URL,
};

const provider = new PolyjuiceHttpProvider(GODWOKEN_RPC_URL, polyjuiceConfig);

const web3 = new Web3(provider);

web3.eth.accounts = new PolyjuiceAccounts(polyjuiceConfig);
const deployerAccount = web3.eth.accounts.wallet.add(DEPLOYER_PRIVATE_KEY);
web3.eth.Contract.setProvider(provider, web3.eth.accounts);

(async () => {
  const balance = BigInt(await web3.eth.getBalance(deployerAccount.address));

  if (balance === 0n) {
    console.log(
      `Insufficient balance. Can't deploy contract. Please deposit funds to your Ethereum address: ${deployerAccount.address}`
    );
    return;
  }

  console.log(`Deploying contract...`);

  const deployTx = new web3.eth.Contract(compiledContractArtifact.abi)
    .deploy({
      data: getBytecodeFromArtifact(compiledContractArtifact),
      arguments: [],
    })
    .send({
      from: deployerAccount.address,
      to: "0x" + new Array(40).fill(0).join(""),
      gas: 6000000,
      gasPrice: "0",
    });

  deployTx.on("transactionHash", (hash) =>
    console.log(`Transaction hash: ${hash}`)
  );

  const receipt = await deployTx;

  console.log(`Deployed contract address: ${receipt.contractAddress}`);
})();

function getBytecodeFromArtifact(contractArtifact) {
  return contractArtifact.bytecode || contractArtifact.data?.bytecode?.object;
}
