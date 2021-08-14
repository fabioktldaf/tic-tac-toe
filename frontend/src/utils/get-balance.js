const { AddressTranslator } = require("nervos-godwoken-integration");

const CompiledContractArtifact = require(`./ERC20.json`);

export default async (web3, ethAddress) => {
  try {
    const sudtAddress = "0xC9BD07Ecf288b65bFD7bfC2B88a84d5D0CC676b3";

    const addressTranslator = new AddressTranslator();
    const polyjuiceAddress =
      addressTranslator.ethAddressToGodwokenShortAddress(ethAddress);

    console.log(`Corresponding Polyjuice address: ${polyjuiceAddress}`);
    console.log(
      `Checking SUDT balance using proxy contract with address: ${sudtAddress}...`
    );

    const contract = new web3.eth.Contract(
      CompiledContractArtifact.abi,
      sudtAddress
    );
    const balance = await contract.methods.balanceOf(polyjuiceAddress).call({
      from: ethAddress,
    });

    console.log(`The balance is: ${balance}`);

    return balance;
  } catch (err) {
    console.log(err);
    debugger;
  }
};
