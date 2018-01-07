const MyToken = artifacts.require("./MyToken.sol");
const TokenPurchase = artifacts.require("./TokenPurchase.sol");

module.exports = function(deployer) {
  deployer.deploy(MyToken);
  deployer.deploy(TokenPurchase);
};
