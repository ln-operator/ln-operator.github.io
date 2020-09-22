const add = (node, card) => node.find('.transactions-break').after(card);
const show = card => card.collapse('show');

/** Add a regular card to a node container

  {
    card: <Card Object>
    node: <Node Container Object>
  }
*/
module.exports = ({card, node}) => {
  if (!card) {
    throw new Error('ExpectedCardToAddToNodeContainer');
  }

  if (!node) {
    throw new Error('ExpectedNodeContainerToAddCard');
  }

  add(node, card);

  show(card);

  return;
};
