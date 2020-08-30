const clone = require('./clone');

const template = '.card.connect-wallet';

/** Create card for connect wallet

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
    throw new Error('ExpectedWindowToGenerateCardForConnectWallet');
  }

  const card = clone({template, win});

  return {card};
};
