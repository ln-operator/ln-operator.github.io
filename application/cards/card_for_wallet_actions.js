const addCard = require('./add_card');
const cardForFailureDetails = require('./card_for_failure_details');
const cardForPayment = require('./card_for_payment');
const {clickReceiveTab} = require('./../events');
const {clickSelectReceiveCoin} = require('./../events');
const {clickSelectReceiveFiat} = require('./../events');
const {clickSendPaymentButton} = require('./../events');
const {clickSendTab} = require('./../events');
const clone = require('./clone');
const {currencySymbols} = require('./../chain');
const {fiatSymbols} = require('./constants');
const {inputInPayRequest} = require('./../events');
const {inputInRequestAmount} = require('./../events');
const {pasteInRequestAmount} = require('./../events');
const {preparePaymentRequest} = require('./../events');
const {submitRequestPayment} = require('./../events');
const {submitSendPayment} = require('./../events');
const updateRequestedPayment = require('./update_requested_payment');

const actionReceive = 'receive';
const activate = elements => elements.forEach(n => n.addClass('active'));
const handleProbeClick = (card, n) => card.find('.probe').on('click', n);
const receiveAmount = card => card.find('.request-amount');
const receiveLink = card => card.find('.prepare-receive .nav-link');
const receiveTab = card => card.find('.receive.tab-pane');
const requestInput = card => card.find('.request');
const sendLink = card => card.find('.prepare-send .nav-link');
const sendTab = card => card.find('.send.tab-pane');
const setCurrency = (card, currency) => card.find('.currency').text(currency);
const setFiat = (card, fiat) => card.find('.fiat.select-fiat').text(fiat);
const setReceiveId = n => n.find('.receive.tab-pane').prop('id', 'receive');
const setSendId = card => card.find('.send.tab-pane').prop('id', 'send');
const shownReceiveTab = (link, n) => link.on('shown.bs.tab', () => n.focus());
const shownSendTab = (link, n) => link.on('shown.bs.tab', () => n.focus());
const template = '.card.wallet-actions';

/** Create card for wallet actions

  {
    lnd: <Authenticated LND API Object>
    network: <Wallet Network Name String>
    win: <Window Object>
  }

  @throws
  <Error>

  @returns
  {
    card: <Card Object>
  }
*/
module.exports = ({lnd, network, win}) => {
  if (!lnd) {
    throw new Error('ExpectedAuthenticatedLndForWalletActionsCard');
  }

  if (!network) {
    throw new Error('ExpectedNetworkNameForWalletActionsCard');
  }

  if (!win) {
    throw new Error('ExpectedWindowToGenerateCardForWalletActions');
  }

  const card = clone({template, win});

  switch (win.sessionStorage.selected_payment_action) {
  case actionReceive:
    activate([receiveLink(card), receiveTab(card)]);
    break;

  default:
    activate([sendLink(card), sendTab(card)]);
    break;
  }

  // Handle clicks on the receive tab link
  clickReceiveTab({card, win});

  // Handle clicks on selecting requesting coins
  clickSelectReceiveCoin({card});

  // Handle clicks on selecting requesting fiat
  clickSelectReceiveFiat({card});

  // Handle clicks on send tab
  clickSendPaymentButton({card});

  // Handle clicks on the send tab link
  clickSendTab({card, win});

  // Handle click on probe
  handleProbeClick(card, event => {
    event.preventDefault();

    const {request} = preparePaymentRequest({card});

    if (!request) {
      return;
    }

    return addCard({
      win,
      card: cardForPayment({lnd, win, request, is_probe: true}).card,
    });
  });

  // Handle input in the send payment form
  inputInPayRequest({card, network, win});

  // Handle input in the request amount form
  inputInRequestAmount({card, win});

  // Handle a. paste in the request amount form
  pasteInRequestAmount({card});

  // Set the currency of a payment request relative to the backing node
  setCurrency(card, currencySymbols[network]);

  // Set the fiat option for a payment request
  setFiat(card, fiatSymbols[network]);

  // Add an id to the receive pane, as is needed for the tab navigator
  setReceiveId(card);

  // Add an id to the send pane, as is needed for the tab navigator
  setSendId(card);

  // Handle receive tab shown
  shownReceiveTab(receiveLink(card), receiveAmount(card));

  // Handle send tab link clicked
  shownSendTab(sendLink(card), requestInput(card));

  // Handle submission of the send payment form
  submitSendPayment({card}, (err, res) => {
    if (!!err) {
      return addCard({win, card: cardForFailureDetails({err, win}).card});
    }

    if (!res.request) {
      return;
    }

    const {card} = cardForPayment({lnd, win, request: res.request});

    return addCard({card, win});
  });

  // Handle submission of request payment form
  submitRequestPayment({card, lnd, win}, (err, invoice) => {
    if (!!err) {
      return addCard({win, card: cardForFailureDetails({err, win}).card});
    }

    return updateRequestedPayment({invoice, network, win});
  });

  return {card};
};
