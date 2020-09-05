const asyncAuto = require('async/auto');
const {decodeFirst} = require('cbor');
const {encode} = require('cbor');
const {getWalletVersion} = require('lightning/lnd_methods');
const {grantAccess} = require('lightning/lnd_methods');
const {returnResult} = require('asyncjs-util');

const getWallets = require('./get_wallets');
const {lndGateway} = require('./../../lnd_web');

const bufferAsHex = buffer => Buffer.from(buffer).toString('hex');
const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const isHex = n => !!n && !(n.length % 2) && /^[0-9A-F]*$/i.test(n);
const urlForPort = port => `http://localhost:${port}/v0/grpc/`;

/** Add a wallet

  {
    credentials: <CBOR Encoded Credentials Hex String>
    win: <Window Object>
  }

  @returns via cbk or Promise
  {
    lnd: <Authenticated LND API Object>
  }
*/
module.exports = ({credentials, win}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isHex(credentials)) {
          return cbk([400, 'ExpectedCredentialsToAddANewWallet']);
        }

        if (!win) {
          return cbk([400, 'ExpectedWindowToAddNewWallet']);
        }

        return cbk();
      },

      // Decode credentials
      decode: ['validate', ({}, cbk) => {
        return decodeFirst(hexAsBuffer(credentials), (err, res) => {
          if (!!err) {
            return cbk([400, 'ExpectedValidCredentialsToAddWallet', {err}]);
          }

          if (!res) {
            return cbk([400, 'ExpectedEncodedCredentialsToAddWallet']);
          }

          if (!res.macaroon) {
            return cbk([400, 'ExpectedMacaroonToAddWallet']);
          }

          if (!res.port && !res.url) {
            return cbk([400, 'ExpectedPortOrUrlToAddWallet']);
          }

          try {
            return cbk(null, {
              macaroon: bufferAsHex(res.macaroon),
              port: res.port || undefined,
              url: res.url || undefined,
            });
          } catch (err) {
            return cbk([400, 'ExpectedMacaroonBytesToAddWallet', {err}]);
          }
        });
      }],

      // Attempt a query with the credentials to verify their operation
      attempt: ['decode', ({decode}, cbk) => {
        const url = new URL(decode.url || urlForPort(decode.port)).href;

        const {lnd} = lndGateway({url, macaroon: decode.macaroon});

        return getWalletVersion({lnd}, (err, res) => {
          if (!!err) {
            return cbk([503, 'FailedToConnectToWalletWithCredentials', {err}]);
          }

          return cbk(null, {lnd, url, macaroon: decode.macaroon});
        });
      }],

      // Swap the given macaroon for a new macaroon
      upgradeMacaroon: ['attempt', ({attempt}, cbk) => {
        return grantAccess({
          is_ok_to_adjust_peers: true,
          is_ok_to_create_chain_addresses: true,
          is_ok_to_create_invoices: true,
          is_ok_to_create_macaroons: true,
          is_ok_to_derive_keys: true,
          is_ok_to_get_chain_transactions: true,
          is_ok_to_get_invoices: true,
          is_ok_to_get_wallet_info: true,
          is_ok_to_get_payments: true,
          is_ok_to_get_peers: true,
          is_ok_to_pay: true,
          is_ok_to_send_to_chain_addresses: true,
          is_ok_to_sign_bytes: true,
          is_ok_to_sign_messages: true,
          is_ok_to_stop_daemon: true,
          is_ok_to_verify_bytes_signatures: true,
          is_ok_to_verify_messages: true,
          lnd: attempt.lnd,
        },
        cbk);
      }],

      // Get existing wallets
      getWallets: ['attempt', ({attempt}, cbk) => getWallets({win}, cbk)],

      // Add or replace credentials to wallets collection
      setWallets: [
        'attempt',
        'getWallets',
        'upgradeMacaroon',
        ({attempt, getWallets, upgradeMacaroon}, cbk) =>
      {
        const wallets = []
          .concat([{macaroon: upgradeMacaroon.macaroon, url: attempt.url}])
          .concat(getWallets.wallets.filter(n => n.url !== attempt.url));

        win.sessionStorage.wallets = bufferAsHex(encode(wallets));

        return cbk();
      }],

      // Construct an upgraded macaroon LND to use for this wallet
      lnd: [
        'attempt',
        'upgradeMacaroon',
        ({attempt, upgradeMacaroon}, cbk) =>
      {
        const {lnd} = lndGateway({
          url: attempt.url,
          macaroon: upgradeMacaroon.macaroon,
        });

        return cbk(null, {lnd});
      }],
    },
    returnResult({reject, resolve, of: 'lnd'}, cbk));
  });
};
