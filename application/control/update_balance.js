const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {getBalance} = require('./../balances');
const {updatePrice} = require('./../fiat');
const {updateWalletBalanceCard} = require('./../cards');

/** Update wallet balance

  {
    card: <Wallet Balance Card Object>
    lnd: <Authenticated LND API Object>
    win: <Window Object>
  }

  @returns via cbk or Promise
*/
module.exports = ({card, lnd, win}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!card) {
          return cbk([400, 'ExpectedWalletBalanceCardToUpdateBalance']);
        }

        if (!lnd) {
          return cbk([400, 'ExpectedAuthenticatedLndToUpdateBalance']);
        }

        if (!win) {
          return cbk([400, 'ExpectedWindowObjectToUpdateBalance']);
        }

        return cbk();
      },

      // Get balance
      getBalance: ['validate', ({}, cbk) => getBalance({lnd}, cbk)],

      // Update the balance
      updateBalance: ['getBalance', ({getBalance}, cbk) => {
        updateWalletBalanceCard({card, balance: getBalance.balance});

        updatePrice({win});

        return cbk();
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
