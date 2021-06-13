
require('dotenv').config();
require("@nomiclabs/hardhat-waffle");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
  networks: {
    hardhat: {
    },
    kovan: {
      url: `https://eth-kovan.alchemyapi.io/v2/${process.env.NODE_KEY}`,
      accounts: {
        mnemonic: process.env.MNEMONICS
      }
    }
  },
  solidity: "0.8.0",
};
