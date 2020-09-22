const addCard = require('./add_card');
const cardForFailureDetails = require('./card_for_failure_details');
const {clickConfirmDisconnect} = require('./../events');
const clone = require('./clone');
const {getWallets} = require('./../wallets');

const closeEvent = n => n.find('.close').on('click', () => n.collapse('hide'));
const handleClick = (card, n) => card.find('.disconnect').on('click', n);
const setPlural = (card, n) => card.find('.plural').prop('hidden', n === 1);
const template = '.card.disconnect-wallets';

/** Create card for disconnect wallets

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
    throw new Error('ExpectedNodeContainerToGenerateCardForDisconnectWallets');
  }

  if (!win) {
    throw new Error('ExpectedWindowToGenerateCardForDisconnectWallets');
  }

  const card = clone({node, template});

  handleClick(card, clickConfirmDisconnect({win}));

  getWallets({win}, (err, res) => {
    if (!!err) {
      return addCard({node, card: cardForFailureDetails({err, node}).card});
    }

    return setPlural(card, res.wallets.length);
  });

  closeEvent(card);

  return {card};
};
