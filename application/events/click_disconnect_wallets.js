const addCard = ($, card) => $('.main-column').prepend(card);
const hideDisconnect = $ => $('.card.disconnect-wallets').collapse('hide');
const showCard = card => card.collapse('show');

/** Generate handler for disconnect wallets click

  {
    card: <Card for Disconnect Wallets Object>
    win: <Window Object>
  }

  @returns
  <Click Handler Function>
*/
module.exports = ({card, win}) => {
  return event => {
    event.preventDefault();

    hideDisconnect(win.jQuery);

    addCard(win.jQuery, card);

    return showCard(card);
  };
};
