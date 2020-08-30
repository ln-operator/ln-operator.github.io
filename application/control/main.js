const asyncAuto = require('async/auto');
const asyncCargo = require('async/cargo');
const {returnResult} = require('asyncjs-util');
const {subscribeToForwards} = require('lightning/lnd_methods');
const {subscribeToInvoices} = require('lightning/lnd_methods');

const {addCard} = require('./../cards');
const {addControl} = require('./../cards');
const {cardForWalletActions} = require('./../cards');
const {cardForWalletBalance} = require('./../cards');
const {cardForWalletConnected} = require('./../cards');
const getLnd = require('./get_lnd');
const {getWalletDetails} = require('./../graph');
const {subscribeToPrice} = require('./../fiat')
const updateBalance = require('./update_balance');
const {updatePrice} = require('./../fiat');
const {updateRequestedPayment} = require('./../cards');
const {updateWalletBalanceCard} = require('./../cards');

const {now} = Date;

/** Start application

  {
    win: <Window Object>
  }

  @returns via cbk or Promise
*/
module.exports = ({win}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!win) {
          return cbk([400, 'ExpectedWindowObjectToInitMainApplication']);
        }

        return cbk();
      },

      // Obtain the LND access object
      getLnd: ['validate', ({}, cbk) => getLnd({win}, cbk)],

      // Subscribe to the price
      subscribeToPrice: ['validate', ({}, cbk) => {
        const sub = subscribeToPrice({win});

        sub.on('price_update', () => updatePrice({win}));

        return;
      }],

      // Add wallet balance card
      addWalletBalance: ['getLnd', ({}, cbk) => {
        const {card} = cardForWalletBalance({win});

        addControl({card, win});

        return cbk(null, {card});
      }],

      // Get general wallet info
      getWallet: ['getLnd', ({getLnd}, cbk) => {
        return getWalletDetails({lnd: getLnd.lnd}, cbk);
      }],

      // Add wallet actions card
      addWalletActions: [
        'addWalletBalance',
        'getLnd',
        'getWallet',
        ({getLnd, getWallet}, cbk) =>
      {
        const {card} = cardForWalletActions({
          win,
          lnd: getLnd.lnd,
          network: getWallet.network,
        });

        addControl({card, win});

        return cbk();
      }],

      // Add wallet connected card
      addWalletConnected: ['addWalletActions', 'getLnd', ({getLnd}, cbk) => {
        // Exit early when the wallet was previously connected
        if (!!getLnd.is_saved_auth) {
          return cbk();
        }

        const {card} = cardForWalletConnected({win});

        addCard({card, win});

        return cbk(null, {card});
      }],

      // Balance updater
      balanceUpdater: [
        'addWalletBalance',
        'getLnd',
        ({addWalletBalance, getLnd}, cbk) =>
      {
        const balanceUpdater = asyncCargo((updates, cbk) => {
          return updateBalance({
            win,
            card: addWalletBalance.card,
            lnd: getLnd.lnd,
          },
          cbk);
        });

        balanceUpdater.push(now(), err => {
          if (err) {
            return cbk(err);
          }

          return cbk(null, balanceUpdater);
        });
      }],

      // Subscribe to node events
      subscribeToForwards: [
        'balanceUpdater',
        'getLnd',
        ({balanceUpdater, getLnd}, cbk) =>
      {
        const sub = subscribeToForwards({lnd: getLnd.lnd});

        sub.on('error', err => cbk(err));
        sub.on('forward', forward => balanceUpdater.push(now()));

        return;
      }],

      // Subscribe to invoice updates
      subscribeToInvoices: [
        'getLnd',
        'getWallet',
        ({getLnd, getWallet}, cbk) =>
      {
        const sub = subscribeToInvoices({lnd: getLnd.lnd});

        sub.on('error', err => cbk(err));
        sub.on('invoice_updated', invoice => {
          return updateRequestedPayment({
            invoice,
            win,
            network: getWallet.network,
          });
        });

        return;
      }],

      // Update the node alias of the wallet balance card
      updateAlias: [
        'addWalletBalance',
        'getWallet',
        ({addWalletBalance, getWallet}, cbk) =>
      {
        updateWalletBalanceCard({
          card: addWalletBalance.card,
          node: getWallet,
        });

        updatePrice({win});

        return cbk();
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};