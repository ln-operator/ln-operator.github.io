const handleClick = (element, handler) => element.on('click', handler);
const receivePaymentAction = 'receive';
const receiveTabLink = card => card.find('.nav-item.prepare-receive a');
const showTab = element => element.tab('show');

/** Click receive tab

  {
    card: <Card Object>
    win: <Window Object>
  }

  @returns
*/
module.exports = ({card, win}) => {
  return handleClick(receiveTabLink(card), event => {
    event.preventDefault();

    win.sessionStorage.selected_payment_action = receivePaymentAction;

    return showTab(receiveTabLink(card));
  });
};
