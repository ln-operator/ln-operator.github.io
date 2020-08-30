const handleClick = (element, handler) => element.on('click', handler);
const preparingSend = card => card.find('.preparing-send');
const startSend = card => card.find('.start-send');

/** Click send payment button

  {
    card: <Card Object>
  }

  @returns
*/
module.exports = ({card}) => {
  return handleClick(startSend(card), event => {
    event.preventDefault();

    return preparingSend(card).submit();
  });
};
