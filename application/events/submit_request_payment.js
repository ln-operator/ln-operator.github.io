const {createInvoice} = require('lightning/lnd_methods');

const {tokensForFiatAmount} = require('./../fiat');

const buttons = card => card.find('.btn');
const currency = 'BTC';
const fiat = 'USD';
const {floor} = Math;
const handleSubmit = (element, handler) => element.on('submit', handler);
const hideInvoiceDetails = n => n.find('.invoice-details').collapse('hide');
const isFiat = card => !card.find('.fiat-selected').prop('hidden');
const prepareReceive = card => card.find('form.preparing-receive');
const requestAmount = card => card.find('.request-amount');
const requestDescription = card => card.find('.invoice-details textarea');
const setDisabled = (element, disabled) => element.prop('disabled', disabled);
const tokensPerBigToken = 1e8;
const triggerInput = element => element.trigger('input');

/** Create handler for submit request payment form

  {
    card: <Card Object>
    lnd: <Authenticated LND API Object>
    win: <Window Object>
  }

  @throws
  <Error>

  @returns
  <Handle Submit Connect Function>
*/
module.exports = ({card, lnd, win}, cbk) => {
  if (!card) {
    throw new Error('ExpectedRequestPaymentCardToHandleSubmitAction');
  }

  if (!lnd) {
    throw new Error('ExpectedAuthenticatedLndToHandleRequestSubmitAction');
  }

  if (!win) {
    throw new Error('ExpectedWindowObjectToHandleSubmitAction');
  }

  return handleSubmit(prepareReceive(card), event => {
    event.preventDefault();

    const amount = parseFloat(requestAmount(card).val());
    const description = requestDescription(card).val().trim();

    // Determine the tokens value to use
    const fiatTokens = tokensForFiatAmount({amount, currency, fiat, win});
    const regularTokens = floor(amount * tokensPerBigToken);

    const tokens = isFiat(card) ? fiatTokens.tokens : regularTokens;

    if (!tokens) {
      return;
    }

    // Reset amount and description values
    requestAmount(card).val(String());
    requestDescription(card).val(String());

    // Trigger input in the amount to update the fiat equivalent
    triggerInput(requestAmount(card));

    const inputElements = [
      buttons(card),
      requestAmount(card),
      requestDescription(card),
    ];

    inputElements.forEach(element => setDisabled(element, true));

    setDisabled(buttons(card), true);
    setDisabled(requestAmount(card), true);
    setDisabled(requestDescription(card), true);

    return createInvoice({
      description,
      lnd,
      tokens,
      is_including_private_channels: true,
    },
    (err, res) => {
      inputElements.forEach(element => setDisabled(element, false));

      hideInvoiceDetails(card);

      if (!!err) {
        return cbk(err);
      }

      return cbk(null, res);
    });
  });
};
