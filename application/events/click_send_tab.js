const handleClick = (element, handler) => element.on('click', handler);
const sendPaymentAction = 'send';
const sendTabLink = card => card.find('.nav-item.prepare-send a');
const showTab = element => element.tab('show');

/** Click send tab

  {
    card: <Card Object>
    win: <Window Object>
  }

  @returns
*/
module.exports = ({card, win}) => {
  return handleClick(sendTabLink(card), event => {
    event.preventDefault();

    win.sessionStorage.selected_payment_action = sendPaymentAction;

    return showTab(sendTabLink(card));
  });
};
