const asyncAuto = require('async/auto');
const {getChainBalance} = require('lightning/lnd_methods');
const {getChannelBalance} = require('lightning/lnd_methods');
const {getChannels} = require('lightning/lnd_methods');
const {getPendingChainBalance} = require('lightning/lnd_methods');
const {returnResult} = require('asyncjs-util');

const {max} = Math;

/** Get the existing balance

  {
    lnd: <Authenticated LND gRPC API Object>
  }

  @returns via cbk
  {
    balance: <Tokens Number>
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!lnd) {
          return cbk([400, 'ExpectedLndToGetBalance']);
        }

        return cbk();
      },

      // Get the chain balance
      getChainBalance: ['validate', ({}, cbk) => getChainBalance({lnd}, cbk)],

      // Get the channel balance
      getChanBalance: ['validate', ({}, cbk) => getChannelBalance({lnd}, cbk)],

      // Get the initiator burden
      getChannels: ['validate', ({}, cbk) => getChannels({lnd}, cbk)],

      // Get the pending balance
      getPending: ['validate', ({}, cbk) => {
        return getPendingChainBalance({lnd}, cbk);
      }],

      // Total balances
      balance: [
        'getChainBalance',
        'getChanBalance',
        'getChannels',
        'getPending',
        ({getChainBalance, getChanBalance, getChannels, getPending}, cbk) =>
      {
        const futureCommitFees = getChannels.channels
          .filter(n => n.is_partner_initiated === false)
          .reduce((sum, n) => sum + n.commit_transaction_fee, Number());

        // Gather all component balances
        const balances = [
          getChainBalance.chain_balance,
          getChanBalance.channel_balance,
          -futureCommitFees,
          getPending.pending_chain_balance || Number(),
        ];

        const balance = balances.reduce((sum, n) => sum + n, Number());

        return cbk(null, {balance});
      }],
    },
    returnResult({reject, resolve, of: 'balance'}, cbk));
  });
};
