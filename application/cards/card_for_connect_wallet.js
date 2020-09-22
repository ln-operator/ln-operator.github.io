const clone = require('./clone');

const template = '.card.connect-wallet';

/** Create card for connect wallet

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
    throw new Error('ExpectedNodeContainerToGenerateCardForConnectWallet');
  }

  const card = clone({node, template});

  return {card};
};
