const asyncAuto = require('async/auto');
const {getWalletVersion} = require('lightning/lnd_methods');
const {returnResult} = require('asyncjs-util');

const {addCard} = require('./../cards');
const {cardForConnectWallet} = require('./../cards');
const {getWallets} = require('./../wallets');
const {lndGateway} = require('./../../lnd_web');
const {submitConnectWallet} = require('./../events');

const handleAuthSubmit = (n, m) => n.find('.authenticate').on('submit', m);

/** Grab authentication details

  {
    win: <Window Object>
  }

  @returns via cbk or Promise
  {
    [is_saved_auth]: <Is Using Saved Authentication Bool>
    lnd: <Authenticated LND API Object>
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
        const [wallet] = getWallets.wallets;

        // Exit early when there is no saved auth
        if (!wallet) {
          return cbk();
        }

        // Exit early when there is no stored auth details
        const {macaroon, url} = wallet;

        const {lnd} = lndGateway({macaroon, url});

        return getWalletVersion({lnd}, (err, res) => {
          if (!!err) {
            return cbk();
          }

          return cbk(null, {lnd});
        });
      }],

      // Add authentication dialog and wait for auth
      getAuth: ['getSavedAuth', ({getSavedAuth}, cbk) => {
        if (!!getSavedAuth) {
          return cbk(null, {lnd: getSavedAuth.lnd, is_saved_auth: true});
        }

        const {card} = cardForConnectWallet({win});

        addCard({card, win});

        return handleAuthSubmit(card, submitConnectWallet({card, win}, cbk));
      }],
    },
    returnResult({reject, resolve, of: 'getAuth'}, cbk));
  });
};
