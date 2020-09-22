const {parsePaymentRequest} = require('invoices');

const clone = require('./clone');
const {copyOnClick} = require('./../events');
const {currencySymbols} = require('./../chain');
const {updatePrice} = require('./../fiat');

const {assign} = Object;
const closeEvent = n => n.find('.close').on('click', () => n.collapse('hide'));
const copyRequest = card => card.find('.copy');
const fiatAmount = card => card.find('.fiat-equivalent');
const linkForRequest = request => `lightning:${request}`;
const qrCode = card => card.find('.qr-code');
const qrOptions = {back: 'rgb(250, 250, 250)', rounded: 100, size: 200};
const revealQrButton = card => card.find('.reveal-qr');
const setAmount = (card, amount) => card.find('.tokens-amount').text(amount);
const setCurrency = (card, currency) => card.find('.currency').text(currency);
const setDescHidden = (card, n) => card.find('.description').prop('hidden', n);
const setDescription = (card, n) => card.find('.description-text').text(n);
const setFiat = (card, tokens) => card.find('.fiat-equivalent').data({tokens});
const setLink = (card, req) => card.find('.payment-amount').prop('href', req);
const setRequest = (card, req) => card.find('.payment-request').val(req);
const template = '.card.requested-payment';
const toggleElement = (btn, n) => btn.on('click', () => n.collapse('toggle'));
const tokensAsBigUnit = tokens => (tokens / 1e8).toFixed(8);

/** Create card for an unconfirmed requested payment

  {
    invoice: {
      id: <Invoice Id String>
      request: <BOLT 11 Request String>
      tokens: <Tokens Number>
    }
    network: <Network Name String>
    node: <Node Container Object>
    win: <Window Object>
  }

  @throws
  <Error>

  @returns
  {
    card: <Card Object>
  }
*/
module.exports = ({invoice, network, node, win}) => {
  if (!node) {
    throw new Error('ExpectedNodeContainerForRequestedPayment');
  }

  if (!win) {
    throw new Error('ExpectedWindowToGenerateCardForRequestedPayment');
  }

  const card = clone({node, template});
  const text = linkForRequest(invoice.request).toUpperCase();

  closeEvent(card);
  copyOnClick({win, copy: copyRequest(card)});
  qrCode(card).append(win.jQuery(win.kjua(assign(qrOptions, {text}))));
  setAmount(card, tokensAsBigUnit(invoice.tokens));
  setCurrency(card, currencySymbols[network]);
  setFiat(card, invoice.tokens);
  setLink(card, linkForRequest(invoice.request));

  // Copy the invoice payment request
  setRequest(card, invoice.request);

  // Setup toggle on qr button to show or hide QR
  toggleElement(revealQrButton(card), qrCode(card));

  // Update the fiat estimate
  updatePrice({win, element: fiatAmount(card)});

  try {
    const {description} = parsePaymentRequest({request: invoice.request});

    setDescHidden(card, !description);
    setDescription(card, description);
  } catch (err) {
    setDescHidden(card, true);
  }

  return {card};
};
