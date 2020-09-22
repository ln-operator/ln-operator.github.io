const {parsePaymentRequest} = require('invoices');

const clone = require('./clone');
const {currencySymbols} = require('./../chain');

const closeEvent = n => n.find('.close').on('click', () => n.collapse('hide'));
const currency = card => card.find('.currency');
const descriptionText = card => card.find('.description-text');
const fiatEquivalent = card => card.find('.fiat-equivalent');
const hexAsUtf8 = hex => Buffer.from(hex, 'hex').toString();
const messageType = '34349334';
const paymentDescription = card => card.find('.description');
const paymentMessage = card => card.find('.message');
const paymentMessageText = card => card.find('.message-text');
const setHidden = (element, hidden) => element.prop('hidden', hidden);
const template = '.card.received-payment';
const tokensAmount = card => card.find('.tokens-amount');
const tokensAsBigUnit = tokens => (tokens / 1e8).toFixed(8);

/** Create card for received payment

  {
    invoice: {
      payments: [{
        messages: [{
          type: <Type String>
          value: <Message Value Hex String>
        }]
      }]
      [request]: <BOLT 11 Payment Request String>
      tokens: <Invoice Tokens Number>
    }
    network: <Network Name String>
    node: <Node Container Object>
  }

  @throws
  <Error>

  @returns
  {
    card: <Card Object>
  }
*/
module.exports = ({invoice, network, node}) => {
  if (!invoice) {
    throw new Error('ExpectedInvoiceToGenerateCardForReceivedPayment');
  }

  if (!network) {
    throw new Error('ExpectedNetworkToGenerateCardForReceivedPayment');
  }

  if (!node) {
    throw new Error('ExpectedNodeContainerToGenerateCardForReceivedPayment');
  }

  const card = clone({node, template});

  closeEvent(card);
  currency(card).text(currencySymbols[network]);
  fiatEquivalent(card).data({tokens: invoice.tokens});
  tokensAmount(card).text(tokensAsBigUnit(invoice.tokens));

  const [payment] = invoice.payments;

  // Show the payment message, if there is one
  if (!!payment && !!payment.messages.length) {
    const [message] = payment.messages.filter(n => n.type === messageType);

    if (!!value) {
      setHidden(paymentMessage(card), false);
      paymentMessageText(card).text(hexAsUtf8(message.value));
    }
  }

  // Set the payment description, if there is one
  try {
    const {description} = parsePaymentRequest({request: invoice.request});

    descriptionText(card).text((description || String()).trim());
    setHidden(paymentDescription(card), !(description || String()).trim());
  } catch (err) {
    setHidden(paymentDescription(card), true);
  }

  return {card};
};
