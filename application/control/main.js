const asyncAuto = require('async/auto');
const asyncCargo = require('async/cargo');
const asyncMap = require('async/map');
const {returnResult} = require('asyncjs-util');
const {subscribeToForwards} = require('lightning/lnd_methods');
const {subscribeToInvoices} = require('lightning/lnd_methods');

const getLnds = require('./get_lnds');
const {getWalletDetails} = require('./../graph');
const {initWallet} = require('./../cards');
const setupNavigation = require('./setup_navigation');
const {subscribeToPrice} = require('./../fiat')
const updateBalance = require('./update_balance');
const {updatePrice} = require('./../fiat');
const {updateRequestedPayment} = require('./../cards');

const {now} = Date;
const show = element => element.prop('hidden', false);

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
      getLnds: ['validate', ({}, cbk) => getLnds({win}, cbk)],

      // Subscribe to the price
      subscribeToPrice: ['validate', ({}, cbk) => {
        const sub = subscribeToPrice({win});

        sub.on('price_update', () => updatePrice({win}));

        return;
      }],

      // Get wallet details
      getWallets: ['getLnds', ({getLnds}, cbk) => {
        return asyncMap(getLnds.wallets, (node, cbk) => {
          return getWalletDetails({lnd: node.lnd}, (err, res) => {
            if (!!err) {
              return cbk(err);
            }

            return cbk(null, {
              alias: res.alias,
              is_saved_auth: node.is_saved_auth,
              lnd: node.lnd,
              network: res.network,
              public_key: res.public_key,
              url: node.url,
            });
          });
        },
        cbk);
      }],

      // Setup the navbar actions
      setupNav: ['getLnds', ({}, cbk) => {
        setupNavigation({win});

        return cbk();
      }],

      // Setup the wallet control cards
      initWallets: ['getWallets', ({getWallets}, cbk) => {
        return asyncMap(getWallets, (node, cbk) => {
          return initWallet({
            win,
            alias: node.alias,
            is_saved_auth: node.is_saved_auth,
            lnd: node.lnd,
            network: node.network,
            public_key: node.public_key,
            url: node.url,
          },
          cbk);
        },
        cbk);
      }],

      // Display default wallet
      displayDefaultWallet: ['initWallets', ({initWallets}, cbk) => {
        const [defaultWallet] = initWallets;

        const selectedWallet = initWallets.find(({node}) => {
          return node.data().url === win.sessionStorage.default_wallet_url;
        });

        const {node} = selectedWallet || defaultWallet;

        show(node);

        return cbk();
      }],

      // Setup balance update workers
      balanceUpdaters: ['initWallets', ({initWallets}, cbk) => {
        return asyncMap(initWallets, (wallet, cbk) => {
          const balanceUpdater = asyncCargo((updates, cbk) => {
            return updateBalance({
              win,
              card: wallet.wallet_balance_card,
              lnd: wallet.lnd,
            },
            cbk);
          });

          return balanceUpdater.push(now(), err => {
            if (!!err) {
              return cbk(err);
            }

            return cbk(null, {lnd: wallet.lnd, updater: balanceUpdater});
          });
        });
      }],

      // Subscribe to node events
      subscribeToForwards: ['balanceUpdaters', ({balanceUpdaters}, cbk) => {
        return asyncMap(balanceUpdaters, ({lnd, updater}, cbk) => {
          const sub = subscribeToForwards({lnd});

          sub.on('error', err => cbk(err));

          // When there is a new forward, push balance update job to worker
          sub.on('forward', forward => updater.push(now()));

          return;
        },
        cbk);
      }],

      // Subscribe to invoice updates
      subscribeToInvoices: ['initWallets', ({initWallets}, cbk) => {
        return asyncMap(initWallets, ({lnd, network, node}, cbk) => {
          const sub = subscribeToInvoices({lnd});

          sub.on('error', err => cbk(err));

          sub.on('invoice_updated', invoice => {
            return updateRequestedPayment({invoice, network, node, win});
          });

          return;
        },
        cbk);
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};