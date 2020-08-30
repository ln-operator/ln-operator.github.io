const {parsePaymentRequest} = require('invoices');

const clone = require('./clone');
const {currencySymbols} = require('./../chain');
const {networkForChain} = require('./../chain');
const {updatePrice} = require('./../fiat');

const closeEvent = n => n.find('.close').on('click', () => n.collapse('hide'));
const currencyLabel = card => card.find('.currency');
const description = card => card.find('.description');
const descriptionText = card => card.find('.description-text');
const feeAmount = card => card.find('.fee-amount');
const fiatEquivalent = card => card.find('.fiat-equivalent');
const hopCount = card => card.find('.hop-count');
const hopPlural = card => card.find('.hop-plural');
const {isArray} = Array;
const paymentAmount = card => card.find('.payment-amount');
const routingFees = card => card.find('.routing-fees');
const setHidden = (element, hidden) => element.prop('hidden', hidden);
const template = '.sent-payment.template';
const tokensAsBigToken = tokens => (tokens / 1e8).toFixed(8);
const totalAmount = card => card.find('.total-amount');

/** Create card for a sent payment

  {
    fee: <Fee Tokens Paid Number>
    hops: [{
      channel: <Standard Format Channel Id String>
      channel_capacity: <Channel Capacity Tokens Number>
      fee_mtokens: <Fee Millitokens String>
      forward_mtokens: <Forward Millitokens String>
      public_key: <Public Key Hex String>
      timeout: <Timeout Block Height Number>
    }]
    request: <BOLT 11 Request String>
    tokens: <Total Tokens Paid Number>
    win: <Window Object>
  }

  @throws
  <Error>

  @returns
  {
    card: <Card Object>
  }
*/
module.exports = ({fee, hops, request, tokens, win}) => {
  if (fee === undefined) {
    throw new Error('ExpectedRoutingFeeToGenerateCardForSentPayment');
  }

  if (!isArray(hops)) {
    throw new Error('ExpectedRoutingHopsToGenerateCardForSentPayment');
  }

  if (!request) {
    throw new Error('ExpectedRequestToGenerateCardForSentPayment');
  }

  if (tokens === undefined) {
    throw new Error('ExpectedTokensToGenerateCardForSentPayment');
  }

  if (!win) {
    throw new Error('ExpectedWindowToGenerateCardForSentPayment');
  }

  const card = clone({template, win});
  const parsed = parsePaymentRequest({request});

  const network = networkForChain[parsed.network];

  closeEvent(card);
  currencyLabel(card).text(currencySymbols[network]);
  descriptionText(card).text((parsed.description || String()).trim());
  feeAmount(card).text(tokensAsBigToken(fee));
  fiatEquivalent(card).data({tokens});
  hopCount(card).text(hops.length);
  paymentAmount(card).text(tokensAsBigToken(parsed.tokens));
  setHidden(description(card), !(parsed.description || String()).trim());
  setHidden(hopPlural(card), hops.length === [request].length);
  setHidden(routingFees(card), !fee);
  totalAmount(card).text(tokensAsBigToken(tokens));

  return {card};
};
