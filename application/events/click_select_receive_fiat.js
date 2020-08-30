const handleClick = (element, handler) => element.on('click', handler);
const requestAmount = card => card.find('.request-amount');
const selectFiat = card => card.find('.select-fiat');
const setCoinUnselected = n => n.find('.coin-selected').prop('hidden', true);
const setFiatSelected = n => n.find('.fiat-selected').prop('hidden', false);
const setMaxAmount = amount => amount.prop('min', '10000');
const setMinAmount = amount => amount.prop('min', '0.01');
const setPlaceholder = amount => amount.prop('placeholder', '0.00');
const setStep = amount => amount.prop('step', '0.01');
const triggerInput = amount => amount.trigger('input');

/** Setup handler for click on receive fiat in prepare receive

  {
    card: <Card Object>
  }
*/
module.exports = ({card}) => {
  if (!card) {
    throw new Error('ExpectedCardToSetupClickSelectReceiveFiat');
  }

  return handleClick(selectFiat(card), event => {
    event.preventDefault();

    const amount = requestAmount(card);

    amount.val(String());
    setCoinUnselected(card);
    setFiatSelected(card);
    setMaxAmount(amount);
    setMinAmount(amount);
    setPlaceholder(amount);
    setStep(amount);

    triggerInput(amount);

    amount.focus();

    return;
  });
};
