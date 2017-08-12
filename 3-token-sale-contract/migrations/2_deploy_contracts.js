const MyToken = artifacts.require("./MyToken.sol");
const TokenSale = artifacts.require("./TokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(MyToken);
  deployer.deploy(TokenSale);
};
