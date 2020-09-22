const {getWalletInfo} = require('lightning/lnd_methods');

const {lndGateway} = require('./../../lnd_web');

const cloneTemplate = card => card.find('.connected-wallet.template').clone();
const hide = element => element.collapse('hide');
const nodeContainers = $ => $('.node-container');
const removeTemplate = element => element.removeClass('template');
const setAlias = (item, a, k) => item.find('.alias').text(a || k.slice(0, 16));
const setHidden = (element, hidden) => element.prop('hidden', hidden);
const setPublicKey = (item, key) => item.find('.public-key').text(key);

/** Connected wallet item

  {
    card: <Connected Wallets Card Object>
    macaroon: <Macaroon String>
    node: <Node Container Object>
    url: <URL String>
    win: <Window Object>
  }

  @returns
  {
    item: <Wallet Item Object>
  }
*/
module.exports = ({card, macaroon, node, url, win}) => {
  const item = cloneTemplate(card);

  removeTemplate(item);
  setHidden(item, false);

  item.click(event => {
    event.preventDefault();

    nodeContainers(win.jQuery).each((i, node) => {
      const nodeUrl = win.jQuery(node).data().url;

      return setHidden(win.jQuery(node), nodeUrl !== url);
    });

    win.sessionStorage.default_wallet_url = url

    return hide(card);
  });

  getWalletInfo({lnd: lndGateway({macaroon, url}).lnd}, (err, res) => {
    if (!!err) {
      return;
    }

    setAlias(item, res.alias, res.public_key);
    setPublicKey(item, res.public_key);

    return;
  });

  return {item}
};
