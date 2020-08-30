const asyncAuto = require('async/auto');
const {decodeFirst} = require('cbor');
const {returnResult} = require('asyncjs-util');

const {isArray} = Array;
const isHex = n => !!n && !(n.length % 2) && /^[0-9A-F]*$/i.test(n);

/** Get list of wallet credentials

  {
    win: <Window Object>
  }

  @returns via cbk or Promise
  {
    wallets: [{
      macaroon: <Hex Encoded Macaroon String>
      url: <URL to Wallet Gateway String>
    }]
  }
*/
module.exports = ({win}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!win) {
          return cbk([400, 'ExpectedWindowObjectToGetSavedWallets']);
        }

        return cbk();
      },

      // Decode saved wallets data
      decode: ['validate', ({}, cbk) => {
        const {wallets} = win.sessionStorage;

        if (!wallets || !isHex(wallets)) {
          return cbk(null, []);
        }

        return decodeFirst(wallets, (err, res) => {
          if (!!err || !isArray(res)) {
            return cbk(null, []);
          }

          return cbk(null, res);
        });
      }],

      // Final set of wallets
      wallets: ['decode', ({decode}, cbk) => {
        const wallets = decode.filter(n => !!n && !!n.macaroon && !!n.url);

        return cbk(null, {wallets});
      }],
    },
    returnResult({reject, resolve, of: 'wallets'}, cbk));
  });
};
