const {subscribeToPayViaRoutes} = require('lightning/lnd_methods');

const cardTitle = card => card.find('.card-title');
const disable = element => element.prop('disabled', true);
const eventError = 'error';
const eventFailure = 'failure';
const eventSuccess = 'success';
const payWithRoute = card => card.find('.pay-with-route');
const setHidden = (element, hidden) => element.prop('hidden', hidden);
const successEvent = 'success';

/** Submit pay with route

  {
    card: <Card Object>
    id: <Payment Hash Hex String>
    lnd: <Authenticated LND API Object>
    route: [{
      fee: <Total Fee Tokens To Pay Number>
      fee_mtokens: <Total Fee Millitokens To Pay String>
      hops: [{
        channel: <Standard Format Channel Id String>
        channel_capacity: <Channel Capacity Tokens Number>
        fee: <Fee Number>
        fee_mtokens: <Fee Millitokens String>
        forward: <Forward Tokens Number>
        forward_mtokens: <Forward Millitokens String>
        public_key: <Public Key Hex String>
        timeout: <Timeout Block Height Number>
      }]
      [messages]: [{
        type: <Message Type Number String>
        value: <Message Raw Value Hex Encoded String>
      }]
      mtokens: <Total Millitokens To Pay String>
      [payment]: <Payment Identifier Hex String>
      timeout: <Expiration Block Height Number>
      tokens: <Total Tokens To Pay Number>
      [total_mtokens]: <Total Millitokens String>
    }]
  }

  @returns
  <Pay With Route Function>
*/
module.exports = ({card, id, lnd, route}, cbk) => {
  cardTitle(card).text(cardTitle(card).data().paying);
  disable(payWithRoute(card));

  const payment = subscribeToPayViaRoutes({id, lnd, routes: [route]});

  payment.on(eventError, err => cbk(err));

  payment.on(eventFailure, ({failure}) => {
    return cbk([503, 'PaymentAttemptFailedToComplete', {failure}]);
  });

  payment.on(eventSuccess, paid => cbk(null, {paid}));

  return;
};
