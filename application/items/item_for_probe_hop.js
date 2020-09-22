const {setNodeAlias} = require('./../graph');

const cloneHop = card => card.find('.hop.template:first').clone();
const fee = item => item.find('.fee');
const hopFee = item => item.find('.hop-fee');
const nodeName = item => item.find('.node-name');
const removeTemplate = item => item.removeClass('template');
const setHidden = (element, hidden) => element.prop('hidden', hidden);
const shortKey = key => key.slice(0, 16);
const tokensAsBigToken = tokens => (tokens / 1e8).toFixed(8);

/** Item for probe hop

  {
    card: <Card Object>
    hop: {
      fee: <Fee Tokens Number>
      public_key: <Public Key Hex String>
    }
    lnd: <Authenticated LND API Object>
    [next]: {
      fee: <Fee Tokens Number>
      public_key: <Public Key Hex String>
    }
  }

  @returns
  {
    item: <Item Object>
  }
*/
module.exports = ({card, hop, lnd, next}) => {
  const item = cloneHop(card);

  hopFee(item).text(tokensAsBigToken(!next ? Number() : hop.fee));
  nodeName(item).text(shortKey(hop.public_key));
  removeTemplate(item);
  setHidden(fee(item), !hop.fee);
  setHidden(hopFee(item), !next);
  setHidden(item, false);
  setNodeAlias({lnd, element: nodeName(item), id: hop.public_key});

  return {item};
};
