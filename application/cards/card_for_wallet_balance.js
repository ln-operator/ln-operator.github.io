const clone = require('./clone');

const template = '.card.wallet-balance';

/** Create card for wallet balance

  {
    win: <Window Object>
  }

  @throws
  <Error>

  @returns
  {
    card: <Card Object>
  }
*/
module.exports = ({win}) => {
  if (!win) {
    throw new Error('ExpectedWindowToGenerateCardForWalletBalance');
  }

  const card = clone({template, win});

  return {card};
};
