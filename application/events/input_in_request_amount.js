const {updatePrice} = require('./../fiat');

const event = 'input';
const fiatEquivalent = form => form.find('.fiat-equivalent');
const {floor} = Math;
const handleInput = (element, handler) => element.on('input', handler);
const isFiatReceiveMode = card => !card.find('.fiat-selected').prop('hidden');
const precision = 8;
const receiveForm = card => card.find('form.preparing-receive');
const requestAmount = card => card.find('.request-amount');
const setFiatPreview = (crd, n) => crd.find('.fiat-preview').prop('hidden', n);
const showInvoiceDetails = n => n.find('.invoice-details').collapse('show');
const tokensPerBigToken = 1e8;

/** Handle input in request amount

  {
    card: <Card Object>
    win: <Window Object>
  }

  @returns
*/
module.exports = ({card, win}) => {
  const amount = requestAmount(card);

  return handleInput(amount, event => {
    const form = receiveForm(card);

    const fiat = fiatEquivalent(form);

    if (!!amount.val()) {
      showInvoiceDetails(card);
    }

    const total = Number(amount.val()).toFixed(precision);

    const tokens = floor(Number(total) * tokensPerBigToken);

    const isFiatHidden = !tokens || isFiatReceiveMode(card);

    fiat.data({tokens});

    setFiatPreview(card, isFiatHidden);

    updatePrice({win});

    return;
  });
};
