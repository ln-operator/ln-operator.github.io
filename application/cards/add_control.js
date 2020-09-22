const add = (card, node) => node.find('.transactions-break').before(card);
const show = card => card.collapse('show');

/** Add a control card to a node container

  {
    card: <Card Object>
    node: <Node Container Object>
  }
*/
module.exports = ({card, node}) => {
  if (!card) {
    throw new Error('ExpectedCardToAddAsWalletControl');
  }

  if (!node) {
    throw new Error('ExpectedNodeContainerToAddWalletControl');
  }

  add(card, node);

  show(card);

  return;
};
