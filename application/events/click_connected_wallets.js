const addCard = (card, node) => node.prepend(card);
const added = card => card.addClass('added');
const hide = n => n.find('.added.card.connected-wallets').collapse('hide');
const showCard = card => card.collapse('show');

/** Generate handler for connected wallets click

  {
    card: <Card for Connected Wallets Object>
    node: <Node Container Object>
  }
*/
module.exports = ({card, node}) => {
  addCard(card, node);

  hide(node);

  added(card);

  return showCard(card);
};
