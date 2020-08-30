const {currencySymbols} = require('./../chain');

const setAlias = (card, alias) => card.find('.node-alias').text(alias);
const setBalance = (card, n) => card.find('.current-wallet-balance').text(n);
const setCurrency = (card, currency) => card.find('.currency').text(currency);
const setFiat = (card, tokens) => card.find('.fiat-equivalent').data({tokens});
const shortKey = key => key.substring(0, 6);
const stopLoading = card => card.find('.loading-wallet-info').remove();
const tokensAsBigToken = tokens => (tokens / 1e8).toFixed(8);

/** Update a wallet balance card

  {
    [balance]: <Total Balance Tokens Number>
    card: <Card Object>
    [node]: {
      alias: <Node Alias String>
      network: <Network Name String>
      public_key: <Node Public Key Hex String>
    }
  }
*/
module.exports = ({balance, card, node}) => {
  if (!card) {
    throw new Error('ExpectedCardToUpdateWalletBalanceCard');
  }

  if (balance !== undefined) {
    setBalance(card, tokensAsBigToken(balance));
    setFiat(card, balance);
  }

  if (!!node) {
    stopLoading(card);

    setAlias(card, node.alias.trim() || shortKey(node.public_key));
    setCurrency(card, currencySymbols[node.network]);
  }

  return;
};
