const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const addCard = require('./add_card');
const addControl = require('./add_control');
const cardForWalletActions = require('./card_for_wallet_actions');
const cardForWalletBalance = require('./card_for_wallet_balance');
const cardForWalletConnected = require('./card_for_wallet_connected');
const {getWalletDetails} = require('./../graph');
const {updatePrice} = require('./../fiat');
const updateWalletBalanceCard = require('./update_wallet_balance_card');

const addNodeContainer = ($, node) => $('.main-column').append(node);
const cloneNodeContainer = $ => $('.node-container.template').clone();
const removeTemplate = node => node.removeClass('template');

/** Initialize wallet components and subscription

  {
    alias: <Node Alias String>
    [is_saved_auth]: <Is A Previously Connect Wallet Bool>
    lnd: <Authenticated LND API Object>
    network: <Node Network String>
    public_key: <Node Public Key Hex String>
    url: <Node Gateway URL String>
    win: <Window Object>
  }

  @returns via cbk or Promise
  {
    lnd: <Authenticated LND API Object>
    network: <Node Network String>
    node: <Node Container Object>
    wallet_balance_card: <Wallet Balance Card Object>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (args.alias === undefined) {
          return cbk([400, 'ExpectedNodeAliasToInitializeWalletControls']);
        }

        if (!args.lnd) {
          return cbk([400, 'ExpectedLndToInitializeWalletControls']);
        }

        if (!args.network) {
          return cbk([400, 'ExpectedNodeNetworkNameToInitializeWallet']);
        }

        if (!args.public_key) {
          return cbk([400, 'ExpectedNodePublicKeyToInitializeWalletControls']);
        }

        if (!args.url) {
          return cbk([400, 'ExpectedNodeGatewayUrlToInitWalletControls']);
        }

        if (!args.win) {
          return cbk([400, 'ExpectedWindowToInitializeWalletControls']);
        }

        return cbk();
      },

      // Create container for a wallet
      node: ['validate', ({}, cbk) => {
        const node = cloneNodeContainer(args.win.jQuery);

        removeTemplate(node);

        node.data({url: args.url});

        addNodeContainer(args.win.jQuery, node);

        return cbk(null, node);
      }],

      // Add wallet balance card
      addWalletBalance: ['node', ({node}, cbk) => {
        const {card} = cardForWalletBalance({node});

        addControl({card, node});

        return cbk(null, {card});
      }],

      // Add wallet actions card
      addWalletActions: ['addWalletBalance', 'node', ({node}, cbk) => {
        const {card} = cardForWalletActions({
          node,
          lnd: args.lnd,
          network: args.network,
          win: args.win,
        });

        // This card is placed into the control section
        addControl({card, node});

        return cbk();
      }],

      // Update the node alias of the wallet balance card
      updateAlias: ['addWalletBalance', ({addWalletBalance}, cbk) => {
        updateWalletBalanceCard({
          card: addWalletBalance.card,
          node: {
            alias: args.alias,
            network: args.network,
            public_key: args.public_key,
          },
        });

        // Balance card introduces new fiat elements that need updating
        updatePrice({win: args.win});

        return cbk();
      }],

      // Add wallet connected card
      addWalletConnected: ['addWalletActions', 'node', ({node}, cbk) => {
        // Exit early when the wallet was previously connected
        if (!!args.is_saved_auth) {
          return cbk();
        }

        const {card} = cardForWalletConnected({node});

        addCard({card, node});

        return cbk(null, {card});
      }],

      // Wallet
      wallet: ['addWalletBalance', 'node', ({addWalletBalance, node}, cbk) => {
        return cbk(null, {
          node,
          lnd: args.lnd,
          network: args.network,
          wallet_balance_card: addWalletBalance.card,
        });
      }],
    },
    returnResult({reject, resolve, of: 'wallet'}, cbk));
  });
};
