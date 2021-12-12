var Rent = artifacts.require("RentContract");

module.exports = function(deployer) {
  deployer.deploy(Rent);
};