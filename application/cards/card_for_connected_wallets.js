const addCard = require('./add_card');
const cardForFailureDetails = require('./card_for_failure_details');
const clone = require('./clone');
const {getWallets} = require('./../wallets');
const {itemForConnectedWallet} = require('./../items');
const {submitConnectWallet} = require('./../events');

const addNode = card => card.find('.add-node');
const addWallet = (card, wallet) => card.find('.wallets').append(wallet);
const connectWallet = card => card.find('.connect-wallet');
const credentials = card => card.find('.credentials');
const hide = card => card.collapse('hide');
const hideNodes = $ => $('.node-container').prop('hidden', true);
const handleSubmit = (card, h) => card.find('.authenticate').on('submit', h);
const show = card => card.collapse('show');
const template = '.card.connected-wallets';

/** Create card for connected wallets list

  {
    node: <Node Container Object>
    win: <Window Object>
  }

  @throws
  <Error>

  @returns
  {
    card: <Card Object>
  }
*/
module.exports = ({node, win}) => {
  if (!node) {
    throw new Error('ExpectedNodeContainerToGenerateCardForConnectedWallets');
  }

  if (!win) {
    throw new Error('ExpectedWindowToGenerateCardForConnectedWallets');
  }

  hideNodes(win.jQuery);

  const card = clone({node, template});

  // List out the wallets
  getWallets({win}, (err, res) => {
    if (!!err) {
      return addCard({node, card: cardForFailureDetails({err, node}).card});
    }

    return res.wallets.forEach(({macaroon, url}) => {
      const {item} = itemForConnectedWallet({card, macaroon, node, url, win});

      return addWallet(card, item);
    });
  });

  // Handle click events on the add wallet button
  connectWallet(card).click(event => {
    event.preventDefault();

    hide(connectWallet(card));
    show(addNode(card));

    credentials(card).focus();

    return;
  });

  // Handle submissions of the connect new wallet form
  handleSubmit(card, submitConnectWallet({card, win}, (err, res) => {
    if (!!err) {
      return addCard({node, card: cardForFailureDetails({err, node}).card});
    }

    hide(card);

    win.sessionStorage.default_wallet_url = res.url

    win.location.reload(false);

    return;
  }));

  return {card};
};
