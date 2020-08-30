const centsPerDollar = 100;
const currentFiatPrice = $ => $('.current-fiat-price');
const currency = 'BTC';
const fiat = 'USD';
const fiatEquivalents = $ => $('.fiat-equivalent');
const formatter = (win, opt) => new win.Intl.NumberFormat(undefined, opt);
const {parse} = JSON;
const priceKey = (from, to) => `price:${from}${to}`;
const style = 'currency';
const tokensPerBigToken = 1e8;

/** Update the fiat price

  {
    [element]: <Element to Update Object>
    win: <Window Object>
  }

  @returns
*/
module.exports = ({element, win}) => {
  if (!win) {
    throw new Error('ExpectedWindowObjectToUpdatePrice');
  }

  const currentPrice = win.localStorage[priceKey(currency, fiat)];
  const fiatEquivalent = element || fiatEquivalents(win.jQuery);
  const fmt = formatter(win, {style, currency: fiat});

  try {
    parse(currentPrice);
  } catch (err) {
    return;
  }

  const {cents} = parse(currentPrice);

  currentFiatPrice(win.jQuery).text(fmt.format(cents / centsPerDollar));

  fiatEquivalent.each(i => {
    const element = win.jQuery(fiatEquivalent.get(i));

    if (!element || !element.data().tokens) {
      return;
    }

    const converted = element.data().tokens / tokensPerBigToken * cents;

    return element.text(fmt.format(converted / centsPerDollar));
  });

  return;
};
