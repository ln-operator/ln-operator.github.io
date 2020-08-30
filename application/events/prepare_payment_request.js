const {parsePaymentRequest} = require('invoices');

const paymentPreview = card => card.find('.payment-preview');
const requestInput = card => card.find('.request');
const setHidden = (element, hidden) => element.prop('hidden', hidden);
const toggleOff = element => element.collapse('hide');

/** Get the request out of the prepare payment request

  {
    card: <Card Object>
  }

  @returns
  {
    [request]: <BOLT 11 Request String>
  }
*/
module.exports = ({card}) => {
  if (!card) {
    throw new Error('ExpectedCardToPreparePaymentRequest');
  }

  const request = requestInput(card).val().trim();

  if (!request) {
    return cbk(null, {});
  }

  try {
    parsePaymentRequest({request});
  } catch (err) {
    return cbk(null, {});
  }

  requestInput(card).val(String());
  toggleOff(paymentPreview(card));

  setHidden(paymentPreview(card), true);

  return {request};
};
