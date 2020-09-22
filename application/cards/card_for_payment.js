const {parsePaymentRequest} = require('invoices');
const {subscribeToProbeForRoute} = require('lightning/lnd_methods');

const addCard = require('./add_card');
const cardForFailureDetails = require('./card_for_failure_details');
const cardForSentPayment = require('./card_for_sent_payment');
const {clickPayWithRoute} = require('./../events');
const clone = require('./clone');
const currencySymbols = require('./../chain');
const {itemForProbeHop} = require('./../items');
const {itemForProbingRoute} = require('./../items');
const {networkForChain} = require('./../chain');
const {setNodeAlias} = require('./../graph');
const {updatePrice} = require('./../fiat');

const cardTitle = card => card.find('.card-title');
const click = 'click';
const closeEvent = n => n.find('.close').on('click', () => n.collapse('hide'));
const defaultMaxFee = 0;
const defaultPathTimeoutMs = 1000 * 60;
const descriptionText = card => card.find('.description-text');
const destinationAlias = card => card.find('.destination-alias');
const destinationKey = card => card.find('.destination-key');
const disable = element => element.prop('disabled', true);
const estimateProgress = attempts => `${Math.round(attempts.length / 3)}%`;
const fiatEquivalent = card => card.find('.fiat-equivalent');
const isDisabled = element => element.prop('disabled');
const payWithRoute = card => card.find('.pay-with-route');
const paymentAmount = card => card.find('.payment-amount');
const paymentCurrency = card => card.find('.payment-currency');
const paymentDescription = card => card.find('.description');
const probeEnd = 'end';
const probeSuccess = 'probe_success';
const probing = 'probing';
const progress = card => card.find('.progress');
const progressBar = card => card.find('.progress-bar');
const quotedDescriptionText = card => card.find('.quoted-description-text');
const removeProbes = card => card.find('.probing-route').prop('hidden', true);
const routeActions = card => card.find('.route-actions');
const routeFoundProgress = '90%';
const routeHops = item => item.find('.hops');
const routes = card => card.find('.routes');
const setHidden = (element, hidden) => element.prop('hidden', hidden);
const shortKey = key => key.slice(0, 16);
const showRoutes = card => card.find('.routes').collapse('show');
const template = '.card.payment';
const tokensAsBigToken = tokens => (tokens / 1e8).toFixed(8);

/** Create card for an outgoing payment

  {
    [is_probe]: <Payment is Probe Bool>
    lnd: <Authenticated LND API Object>
    node: <Node Container Object>
    request: <BOLT 11 Request String>
    win: <Window Object>
  }

  @throws
  <Error>

  @returns
  {
    card: <Card Object>
  }
*/
module.exports = args => {
  if (!args.lnd) {
    throw new Error('ExpectedLndToGenerateCardForOutgoingPayment');
  }

  if (!args.request) {
    throw new Error('ExpectedRequestToGenerateCardForOutgoingPayment');
  }

  if (!args.node) {
    throw new Error('ExpectedNodeContainerToGenerateCardForOutgoingPayment');
  }

  if (!args.win) {
    throw new Error('ExpectedWindowToGenerateCardForOutgoingPayment');
  }

  const attempts = [];
  const card = clone({template, node: args.node});
  const parsed = parsePaymentRequest({request: args.request});

  const network = networkForChain[parsed.network];

  closeEvent(card);
  descriptionText(card).text((parsed.description || String()).trim());
  destinationAlias(card).text(shortKey(parsed.destination));
  destinationKey(card).text(parsed.destination);
  fiatEquivalent(card).data({tokens: parsed.tokens});
  setHidden(quotedDescriptionText(card), !parsed.description);
  paymentAmount(card).text(tokensAsBigToken(parsed.tokens));
  paymentCurrency(card).text(currencySymbols[network]);
  progressBar(card).width(Number());

  updatePrice({element: fiatEquivalent(card), win: args.win});

  setNodeAlias({
    element: destinationAlias(card),
    id: parsed.destination,
    lnd: args.lnd,
  });

  const sub = subscribeToProbeForRoute({
    cltv_delta: parsed.cltv_delta,
    destination: parsed.destination,
    features: parsed.features,
    lnd: args.lnd,
    mtokens: parsed.mtokens,
    path_timeout_ms: defaultPathTimeoutMs,
    payment: parsed.payment,
    routes: parsed.routes,
    total_mtokens: !!parsed.payment ? parsed.mtokens : undefined,
  });

  // Handle no route being found
  sub.on(probeEnd, () => {
    card.remove();

    const err = [503, 'FailedToFindRouteToDestination'];

    return addCard({
      card: cardForFailureDetails({err, node: args.node}).card,
      node: args.node,
    });
  });

  // Handle the probe finding a route
  sub.on(probeSuccess, ({route}) => {
    sub.removeAllListeners();

    progressBar(card).width(routeFoundProgress);

    // Set the pay button to pay using the route
    payWithRoute(card).on(click, () => {
      if (isDisabled(payWithRoute(card))) {
        return;
      }

      disable(payWithRoute(card));

      return clickPayWithRoute({
        card,
        route,
        id: parsed.id,
        lnd: args.lnd,
      },
      (err, res) => {
        setHidden(card, true);

        if (!!err) {
          return addCard({
            card: cardForFailureDetails({err, node: args.node}).card,
            node: args.node,
          });
        }

        const sentPayment = cardForSentPayment({
          fee: res.paid.fee,
          hops: res.paid.hops,
          node: args.node,
          request: args.request,
          tokens: res.paid.tokens,
          win: args.win,
        });

        addCard({card: sentPayment.card, node: args.node});

        updatePrice({win: args.win});

        return;
      });
    });

    // Exit early when the fee is too high or the payment is a probe
    if (route.fee > defaultMaxFee || args.is_probe) {
      cardTitle(card).text(cardTitle(card).data().foundRoute);
      setHidden(routeActions(card), false);
      setHidden(progress(card), true);
      showRoutes(card);
      setHidden(paymentDescription(card), false);

      return;
    }

    payWithRoute(card).click();

    return;
  });

  // Searching for a route
  sub.on(probing, ({route}) => {
    const hops = route.hops.length;

    attempts.push(route);
    removeProbes(card);

    progressBar(card).width(estimateProgress(attempts));

    const {item} = itemForProbingRoute({card, hops, fee: route.fee});

    const hopItems = route.hops.map((hop, i) => {
      return itemForProbeHop({
        card,
        hop,
        lnd: args.lnd,
        next: route.hops[i + [hop].length],
      });
    });

    hopItems.forEach(n => routeHops(item).append(n.item));

    return routes(card).prepend(item);
  });

  return {card};
};
