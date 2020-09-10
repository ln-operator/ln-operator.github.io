const {clickConfirmDisconnect} = require('./../events');
const clone = require('./clone');

const closeEvent = n => n.find('.close').on('click', () => n.collapse('hide'));
const handleClick = (card, n) => card.find('.disconnect').on('click', n);
const template = '.card.disconnect-wallets';

/** Create card for disconnect wallets

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
    throw new Error('ExpectedWindowToGenerateCardForDisconnectWallets');
  }

  const card = clone({template, win});

  handleClick(card, clickConfirmDisconnect({win}));

  closeEvent(card);

  return {card};
};
