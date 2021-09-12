require('babel-register');
require('babel-polyfill');
const path = require("path");
require('dotenv').config({path: "./.env"});
const HDWalletProvider = require('@truffle/hdwallet-provider');
const AccountIndex = 0;

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    rinkeby_infura: {
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, 'https://rinkeby.infura.io/v3/bff6ddfbc539450c8bda156c8a71484c', AccountIndex)
      },
      skipDryRun: true,
      network_id: 4
    },
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      version: "^0.8.0"
    }
  }
}
