const asyncAuto = require('async/auto');
const {getWalletInfo} = require('lightning/lnd_methods');
const {returnResult} = require('asyncjs-util');

const {chains} = require('./constants');

const {keys} = Object;
const reversedBytes = hex => Buffer.from(hex, 'hex').reverse().toString('hex');

/** Get wallet details

  {
    lnd: <Authenticated LND gRPC API Object>
  }

  @returns via cbk or Promise
  {
    alias: <Node Alias String>
    network: <Network Name String>
    public_key: <Public Key Hex String>
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!lnd) {
          return cbk([400, 'ExpectedLndToGetWalletDetails']);
        }

        return cbk();
      },

      // Get wallet info
      getInfo: ['validate', ({}, cbk) => getWalletInfo({lnd}, cbk)],

      // Network for swap
      network: ['getInfo', ({getInfo}, cbk) => {
        const [chain, otherChain] = getInfo.chains;

        if (!!otherChain) {
          return cbk([400, 'CannotDetermineChainFromNode']);
        }

        const network = keys(chains).find(network => {
          return chain === reversedBytes(chains[network]);
        });

        if (!network) {
          return cbk([400, 'ExpectedLndWithKnownChain']);
        }

        return cbk(null, {
          network,
          alias: getInfo.alias,
          public_key: getInfo.public_key,
        });
      }],
    },
    returnResult({reject, resolve, of: 'network'}, cbk));
  });
};
