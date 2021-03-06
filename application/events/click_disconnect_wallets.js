const addCard = (card, node) => node.prepend(card);
const added = card => card.addClass('added');
const hide = n => n.find('.added.card.disconnect-wallets').collapse('hide');
const showCard = card => card.collapse('show');

/** Generate handler for disconnect wallets click

  {
    card: <Card for Disconnect Wallets Object>
    node: <Node Container Object>
  }
*/
module.exports = ({card, node}) => {
  event.preventDefault();

  addCard(card, node);

  hide(node);

  added(card);

  return showCard(card);
};
