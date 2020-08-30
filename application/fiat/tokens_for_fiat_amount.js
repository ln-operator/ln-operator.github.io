const centsPerDollar = 100;
const {floor} = Math;
const {parse} = JSON;
const priceKey = (currency, fiat) => `price:${currency}${fiat}`;
const tokensPerBigToken = 1e8;

/** Convert a fiat amount into tokens using the saved conversion rate

  {
    amount: <Fiat Amount Number>
    currency: <Currency String>
    fiat: <Fiat String>
    win: <Window Object>
  }

  @returns
  {
    [tokens]: <Tokens Number>
  }
*/
module.exports = ({amount, currency, fiat, win}) => {
  const tokens = floor(amount * tokensPerBigToken);

  const price = win.localStorage[priceKey(currency, fiat)];

  try {
    const rate = (parse(price).cents / centsPerDollar);

    return {tokens: floor(amount / rate * tokensPerBigToken)};
  } catch (err) {
    return {};
  }
};