const addCard = require('./add_card');
const addControl = require('./add_control');
const cardForConnectWallet = require('./card_for_connect_wallet');
const cardForFailureDetails = require('./card_for_failure_details');
const cardForReceivedPayment = require('./card_for_received_payment');
const cardForWalletActions = require('./card_for_wallet_actions');
const cardForWalletBalance = require('./card_for_wallet_balance');
const cardForWalletConnected = require('./card_for_wallet_connected');
const updateRequestedPayment = require('./update_requested_payment');
const updateWalletBalanceCard = require('./update_wallet_balance_card');

module.exports = {
  addCard,
  addControl,
  cardForConnectWallet,
  cardForFailureDetails,
  cardForReceivedPayment,
  cardForWalletActions,
  cardForWalletBalance,
  cardForWalletConnected,
  updateRequestedPayment,
  updateWalletBalanceCard,
};
