const handleClick = (element, handler) => element.on('click', handler);
const requestAmount = card => card.find('.request-amount');
const selectCoin = card => card.find('.select-coin');
const setCoinSelected = n => n.find('.coin-selected').prop('hidden', false);
const setFiatUnselected = n => n.find('.fiat-selected').prop('hidden', true);
const setMaxAmount = amount => amount.prop('min', '0.04194304');
const setMinAmount = amount => amount.prop('min', '0.00000001');
const setPlaceholder = amount => amount.prop('placeholder', '0.00000000');
const setStep = amount => amount.prop('step', '0.00000001');
const triggerInput = amount => amount.trigger('input');

/** Setup handler for click on receive coin in prepare receive

  {
    card: <Card Object>
  }
*/
module.exports = ({card}) => {
  if (!card) {
    throw new Error('ExpectedCardToSetupClickSelectReceiveCoin');
  }

  return handleClick(selectCoin(card), event => {
    event.preventDefault();

    const amount = requestAmount(card);

    amount.val(String());
    setCoinSelected(card);
    setFiatUnselected(card);
    setMaxAmount(amount);
    setMinAmount(amount);
    setPlaceholder(amount);
    setStep(amount);

    triggerInput(amount);

    amount.focus();

    return;
  });
};
