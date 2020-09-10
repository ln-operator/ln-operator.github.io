const clickConfirmDisconnect = require('./click_confirm_disconnect');
const clickDisconnectWallets = require('./click_disconnect_wallets');
const clickPayWithRoute = require('./click_pay_with_route');
const clickReceiveTab = require('./click_receive_tab');
const clickSelectReceiveCoin = require('./click_select_receive_coin');
const clickSelectReceiveFiat = require('./click_select_receive_fiat');
const clickSendPaymentButton = require('./click_send_payment_button');
const clickSendTab = require('./click_send_tab');
const copyOnClick = require('./copy_on_click');
const inputInPayRequest = require('./input_in_pay_request');
const inputInRequestAmount = require('./input_in_request_amount');
const pasteInRequestAmount = require('./paste_in_request_amount');
const preparePaymentRequest = require('./prepare_payment_request');
const submitConnectWallet = require('./submit_connect_wallet');
const submitRequestPayment = require('./submit_request_payment');
const submitSendPayment = require('./submit_send_payment');

module.exports = {
  clickConfirmDisconnect,
  clickDisconnectWallets,
  clickPayWithRoute,
  clickReceiveTab,
  clickSelectReceiveCoin,
  clickSelectReceiveFiat,
  clickSendPaymentButton,
  clickSendTab,
  copyOnClick,
  inputInPayRequest,
  inputInRequestAmount,
  pasteInRequestAmount,
  preparePaymentRequest,
  submitConnectWallet,
  submitRequestPayment,
  submitSendPayment,
};
