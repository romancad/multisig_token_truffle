const Contract = artifacts.require('MultiSigWallet.sol');
const Token = artifacts.require('AbcToken.sol');

module.exports = async function (deployer) {
  await deployer.deploy(Token);
  const token = await Token.deployed();
  await deployer.deploy(Contract, token.address);
};
