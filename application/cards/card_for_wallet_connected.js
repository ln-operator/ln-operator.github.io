const clone = require('./clone');

const closeEvent = n => n.find('.close').on('click', () => n.collapse('hide'));
const template = '.card.wallet-connected';

/** Create card to notify wallet connected

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
    throw new Error('ExpectedWindowToGenerateCardForWalletConnected');
  }

  const card = clone({template, win});

  closeEvent(card);

  return {card};
};
