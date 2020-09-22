const clone = require('./clone');

const closeEvent = n => n.find('.close').on('click', () => n.collapse('hide'));
const template = '.card.wallet-connected';

/** Create card to notify wallet connected

  {
    node: <Node Container Object>
  }

  @throws
  <Error>

  @returns
  {
    card: <Card Object>
  }
*/
module.exports = ({node}) => {
  if (!node) {
    throw new Error('ExpectedNodeContainerToGenerateCardForWalletConnected');
  }

  const card = clone({node, template});

  closeEvent(card);

  return {card};
};
