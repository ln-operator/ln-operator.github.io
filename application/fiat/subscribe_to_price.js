const EventEmitter = require('events');

const asyncForever = require('async/forever');

const getCurrentPrice = require('./get_coindesk_current_price');
const request = require('./request');

const currency = 'BTC';
const event = 'price_update';
const fiat = 'USD';
const {now} = Date;
const priceCheckIntervalMs = 1000 * 60 * 5;
const priceKey = (from, to) => `price:${from}${to}`;

/** Subscribe to the fiat exchange price

  {
    win: <Window Object>
  }

  @returns
  <EventEmitter Object>

  @event 'price_update'
  {
    cents: <Cents Per Token Number>
    date: <Updated At ISO 8601 Date String>
  }
*/
module.exports = ({win}) => {
  if (!win) {
    throw new Error('ExpectedWindowObjectToSubscribeToPriceUpdates');
  }

  const emitter = new EventEmitter();

  asyncForever(cbk => {
    const existing = win.localStorage[priceKey(currency, fiat)];
    const staleAt = new Date(now() - priceCheckIntervalMs).toISOString();

    try {
      // Exit early when the price date is fresh
      if (!!existing && parse(existing).date > staleAt) {
        return setTimeout(cbk, priceCheckIntervalMs);
      }
    } catch (err) {
      // Ignore errors in parsing
    }

    return getCurrentPrice({currency, fiat, request, win}, (err, res) => {
      // Exit early when there is no listener for the subscription
      if (!emitter.listenerCount(event).length) {
        return cbk([400, 'NoListenerFoundForPriceUpdates']);
      }

      // Exit early when there is no price update
      if (!res) {
        return setTimeout(cbk, priceCheckIntervalMs);
      }

      const oldPrice = win.localStorage[priceKey(currency, fiat)];

      // Exit early when the price is the same
      if (oldPrice === stringify(res)) {
        return setTimeout(cbk, priceCheckIntervalMs);
      }

      win.localStorage[priceKey(currency, fiat)] = stringify(res);

      emitter.emit(event, res);

      return setTimeout(cbk, priceCheckIntervalMs);
    });
  },
  () => {});

  return emitter;
};
