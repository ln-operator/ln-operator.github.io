const deactivateSend = card => card.find('.send').removeClass('active');
const handleClick = (element, handler) => element.on('click', handler);
const hideTab = element => element.tab('dispose');
const receivePaymentAction = 'receive';
const receiveTab = card => card.find('.receive');
const receiveTabLink = card => card.find('.nav-item.prepare-receive a');
const sendTabLink = card => card.find('.nav-item.prepare-send a');
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

    deactivateSend(card);
    showTab(receiveTab(card));
    hideTab(sendTabLink(card));

    win.sessionStorage.selected_payment_action = receivePaymentAction;

    showTab(receiveTabLink(card));

    return;
  });
};
