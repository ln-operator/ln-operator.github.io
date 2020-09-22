const {cardForConnectedWallets} = require('./../cards');
const {cardForDisconnectWallets} = require('./../cards');
const {clickConnectedWallets} = require('./../events');
const {clickDisconnectWallets} =  require('./../events');

const disconnectButton = nav => nav.find('.disconnect-wallets');
const handleClick = (element, handler) => element.on('click', handler);
const navigationBar = win => win.jQuery('#nav');
const nodeContainer = $ => $('#node-absent');
const show = element => element.collapse('show');
const walletsLink = nav => nav.find('.connected-wallets');

/** Setup navigation bar

  {
    win: <Window Object>
  }
*/
module.exports = ({win}) => {
  const nav = navigationBar(win);
  const node = nodeContainer(win.jQuery);

  show(nav);

  handleClick(disconnectButton(nav), event => {
    event.preventDefault();

    const {card} = cardForDisconnectWallets({node, win});

    return clickDisconnectWallets({card, node});
  });

  handleClick(walletsLink(nav), event => {
    event.preventDefault();

    const {card} = cardForConnectedWallets({node, win});

    return clickConnectedWallets({card, node});
  });

  return;
};
