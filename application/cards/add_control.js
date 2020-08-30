const add = ($, card) => $('.transactions-break').before(card);
const show = card => card.collapse('show');

/** Add a card to the app

  {
    card: <Card Object>
    win: <Window Object>
  }
*/
module.exports = ({card, win}) => {
  add(win.jQuery, card);

  show(card);

  return;
};
