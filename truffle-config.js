var HDWalletProvider = require('truffle-hdwallet-provider');

var mnemonic = 'involve purity obtain garlic brass swim deal evidence juice few unhappy laptop';

module.exports = {
  networks: { 
    development: {
      host: '127.0.0.1',
      port: 7545,
      network_id: "*"
    }, 
    rinkeby: {
      provider: function() { 
        return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3/cf425ce95858490798f86516fdcd12cd') 
      },
      network_id: 4,
      gas: 4500000,
      gasPrice: 10000000000,
    }
  }
};