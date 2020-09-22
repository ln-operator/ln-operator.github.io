const clone = require('./clone');

const template = '.card.wallet-balance';

/** Create card for wallet balance

  {
    node: <Node Containerr Object>
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
    throw new Error('ExpectedNodeContainerToGenerateCardForWalletBalance');
  }

  const card = clone({node, template});

  return {card};
};
