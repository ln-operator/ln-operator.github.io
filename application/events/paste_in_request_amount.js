const {parsePaymentRequest} = require('invoices');

const event = 'paste';
const getPasted = e => e.originalEvent.clipboardData.getData('text').trim();
const handlePaste = (element, handler) => element.on('paste', handler);
const requestAmount = card => card.find('.request-amount');
const requestInput = card => card.find('.request');
const showSendTab = card => card.find('.nav-item.prepare-send a').tab('show');
const triggerInput = element => element.trigger('input');

/** Handle paste in request amount

  {
    card: <Card Object>
  }

  @returns
*/
module.exports = ({card}) => {
  return handlePaste(requestAmount(card), event => {
    const input = requestInput(card);
    const request = getPasted(event);

    try {
      parsePaymentRequest({request});
    } catch (err) {
      return true;
    }

    event.preventDefault();

    card.find('.receive').removeClass('active');
    card.find('.send').addClass('active');

    input.val(request);

    triggerInput(input);

    showSendTab(card);

    return false;
  });
};
