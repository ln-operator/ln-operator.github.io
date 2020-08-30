const preparePaymentRequest = require('./prepare_payment_request');

const handleSubmit = (element, handler) => element.on('submit', handler);
const preparingSend = card => card.find('.preparing-send');

/** Create handler for submit send payment form

  {
    card: <Card Object>
  }

  @throws
  <Error>

  @returns
  <Handle Submit Connect Function>
*/
module.exports = ({card}, cbk) => {
  if (!card) {
    throw new Error('ExpectedCardToHandleSubmitSendPaymentRequest');
  }

  return handleSubmit(preparingSend(card), event => {
    event.preventDefault();

    const {request} = preparePaymentRequest({card});

    return cbk(null, {request});
  });
};
