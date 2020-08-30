const addCard = require('./add_card');
const cardForReceivedPayment = require('./card_for_received_payment');
const cardForRequestedPayment = require('./card_for_requested_payment');
const invoices = {};

/** Update requested payment

  {
    invoice: {
      [chain_address]: <Backup Address String>
      created_at: <ISO 8601 Date String>
      description: <Description String>
      id: <Payment Hash Hex String>
      [is_confirmed]: <Invoice is Confirmed Bool>
      [mtokens]: <Millitokens String>
      [request]: <BOLT 11 Encoded Payment Request String>
      [secret]: <Hex Encoded Payment Secret String>
      [tokens]: <Tokens Number>
    }
    network: <Network Name String>
    win: <Window Object>
  }
*/
module.exports = ({invoice, network, win}) => {
  if (!invoice) {
    throw new Error('ExpectedInvoiceToUpdateRequestedPayment');
  }

  if (!network) {
    throw new Error('ExpectedNetworkToUpdateRequestedPayment');
  }

  if (!win) {
    throw new Error('ExpectedWindowToUpdateRequestedPayment');
  }

  const existing = invoices[invoice.id];

  invoices[invoice.id] = existing || {};

  const isNewInvoice = !invoice.is_confirmed && !!invoice.request && !existing;
  const isReceivedPayment = !!invoice.is_confirmed && !!invoice.request;

  // Add a requested payment card when this invoice is a new requested payment
  if (isNewInvoice) {
    invoices[invoice.id].is_confirmed = false;

    const {card} = cardForRequestedPayment({invoice, network, win});

    invoices[invoice.id].card = card;

    addCard({card, win});
  }

  // Add a received payment card when this invoice is a new received payment
  if (isReceivedPayment && (!existing || existing.is_confirmed !== true)) {
    const {card} = cardForReceivedPayment({invoice, network, win});

    if (!!existing && !!existing.card) {
      existing.card.remove();
    }

    invoices[invoice.id].is_confirmed = true;

    addCard({card, win});
  }

  return;
};
