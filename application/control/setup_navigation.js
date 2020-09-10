const {cardForDisconnectWallets} = require('./../cards');
const {clickDisconnectWallets} =  require('./../events');

const disconnectButton = nav => nav.find('.disconnect-wallets');
const handleClick = (element, handler) => element.on('click', handler);
const navigationBar = win => win.jQuery('#nav');
const show = element => element.collapse('show');

/** Setup navigation bar

  {
    win: <Window Object>
  }
*/
module.exports = ({win}) => {
  const {card} = cardForDisconnectWallets({win});
  const nav = navigationBar(win);

  show(nav);

  handleClick(disconnectButton(nav), clickDisconnectWallets({card, win}));

  return;
};
