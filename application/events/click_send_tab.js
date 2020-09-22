const deactivateReceive = card => card.find('.receive').removeClass('active');
const handleClick = (element, handler) => element.on('click', handler);
const hideTab = element => element.tab('dispose');
const receiveTab = card => card.find('.receive');
const receiveTabLink = card => card.find('.nav-item.prepare-receive a');
const sendPaymentAction = 'send';
const sendTab = card => card.find('.send');
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

    deactivateReceive(card);
    hideTab(receiveTabLink(card));
    showTab(sendTab(card));

    win.sessionStorage.selected_payment_action = sendPaymentAction;

    return showTab(sendTabLink(card));
  });
};
