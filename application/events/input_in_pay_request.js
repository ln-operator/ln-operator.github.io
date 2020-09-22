const {parsePaymentRequest} = require('invoices');

const {currencySymbols} = require('./../chain');
const {isChainForNetwork} = require('./../chain');
const {updatePrice} = require('./../fiat');

const bigTokens = card => card.find('.big-tokens');
const event = 'input';
const expirationTime = card => card.find('.expiration');
const fiatEquivalent = card => card.find('.fiat-equivalent');
const handleInput = (element, handler) => element.on('input', handler);
const hide = element => element.prop('hidden', true);
const hideSend = card => card.find('.send').removeClass('active');
const isNumber = n => !isNaN(n);
const paymentDescription = card => card.find('.payment-description');
const paymentDestination = card => card.find('.destination');
const paymentPreview = card => card.find('.payment-preview');
const receiveTabLink = card => card.find('.nav-item.prepare-receive a');
const requestAmount = card => card.find('.request-amount');
const requestInput = card => card.find('.request');
const setHidden = (element, hidden) => element.prop('hidden', hidden);
const setText = (element, text) => element.text(text);
const showReceive = card => card.find('.receive').addClass('active');
const showTab = link => link.tab('show');
const tokensAsBigTokens = n => (n / 1e8).toFixed(8);
const triggerInput = element => element.trigger('input');
const walletCurrency = card => card.find('.wallet-currency');

/** Handle input in request amount

  {
    card: <Card Object>
    network: <Network Name String>
    win: <Window Object>
  }

  @returns
*/
module.exports = ({card, network, win}) => {
  if (!card) {
    throw new Error('ExpectedCardToHandleInputInPayRequest');
  }

  if (!network) {
    throw new Error('ExpectedNetworkToHandleInputInPayRequest');
  }

  if (!win) {
    throw new Error('ExpectedWindowObjectToHandleInputInPayrequest');
  }

  return handleInput(requestInput(card), event => {
    const request = requestInput(card).val().trim();

    // Exit early when the request is a number
    if (!!request && isNumber(request)) {
      showReceive(card);
      hideSend(card);
      hide(paymentPreview(card));
      requestAmount(card).val(request);
      requestInput(card).val(String());
      showTab(receiveTabLink(card));
      triggerInput(requestAmount(card));
      return;
    }

    try {
      parsePaymentRequest({request});
    } catch (err) {
      // Exit early when the payment request is invalid
      return hide(paymentPreview(card));
    }

    const payment = parsePaymentRequest({request});

    // Exit early when the payment request is for another chain
    if (!isChainForNetwork({network, chain: payment.network})) {
      return hide(paymentPreview(card));
    }

    const description = (payment.description || String()).trim();
    const expirationDate = new Date(payment.expires_at);

    fiatEquivalent(card).data({tokens: payment.tokens});
    setHidden(paymentDescription(card), !payment.description);
    setHidden(paymentPreview(card), false);
    setText(bigTokens(card), tokensAsBigTokens(payment.tokens));
    setText(expirationTime(card), expirationDate.toLocaleString());
    setText(paymentDescription(card), description);
    setText(paymentDestination(card), payment.destination);
    setText(walletCurrency(card), currencySymbols[network]);

    updatePrice({win});

    return;
  });
};
