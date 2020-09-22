const asyncAuto = require('async/auto');
const asyncMap = require('async/map');
const {getWalletVersion} = require('lightning/lnd_methods');
const {returnResult} = require('asyncjs-util');

const {addCard} = require('./../cards');
const {cardForConnectWallet} = require('./../cards');
const {getWallets} = require('./../wallets');
const {lndGateway} = require('./../../lnd_web');
const {submitConnectWallet} = require('./../events');

const handleAuthSubmit = (n, m) => n.find('.authenticate').on('submit', m);
const nodeContainer = $ => $('#node-absent');

/** Grab authentication details

  {
    win: <Window Object>
  }

  @returns via cbk or Promise
  {
    wallets: [{
      [is_saved_auth]: <Is Using Saved Authentication Bool>
      lnd: <Authenticated LND API Object>
      url: <Gateway LND URL String>s
    }]
  }
*/
module.exports = ({win}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!win) {
          return cbk([400, 'ExpectedWindowObjectToGetLnd']);
        }

        return cbk();
      },

      // Get saved wallets data
      getWallets: ['validate', ({}, cbk) => getWallets({win}, cbk)],

      // Check if there is saved auth
      getSavedAuth: ['getWallets', ({getWallets}, cbk) => {
        return asyncMap(getWallets.wallets, (wallet, cbk) => {
          const {macaroon, url} = wallet;

          const {lnd} = lndGateway({macaroon, url});

          return getWalletVersion({lnd}, (err, res) => {
            if (!!err) {
              return cbk();
            }

            return cbk(null, {lnd, url, is_saved_auth: true});
          });
        },
        cbk);
      }],

      // Add authentication dialog and wait for auth
      getAuth: ['getSavedAuth', ({getSavedAuth}, cbk) => {
        const wallets = getSavedAuth.filter(n => !!n);

        if (!!wallets.length) {
          return cbk(null, {wallets});
        }

        const node = nodeContainer(win.jQuery);

        const {card} = cardForConnectWallet({node});

        addCard({card, node});

        return handleAuthSubmit(card, submitConnectWallet({card, win}, cbk));
      }],
    },
    returnResult({reject, resolve, of: 'getAuth'}, cbk));
  });
};
