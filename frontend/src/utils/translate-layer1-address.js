const { AddressTranslator } = require("nervos-godwoken-integration");

export default async (web3, ethAddress) => {
  const addressTranslator = new AddressTranslator();
  const depositAddress = await addressTranslator.getLayer2DepositAddress(
    web3,
    ethAddress
  );

  console.log(
    `Layer 2 Deposit Address on Layer 1: \n${JSON.stringify(depositAddress)}`
  );

  return depositAddress.addressString;
};
