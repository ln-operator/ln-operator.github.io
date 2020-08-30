const add = ($, card) => $('.transactions-break').after(card);
const show = card => card.collapse('show');

/** Add a control to the app

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
