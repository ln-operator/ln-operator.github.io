const {addWallet} = require('./../wallets');

const addFailure = (card, failure) => card.find('.failure').append(failure);
const cloneFailure = card => card.find('.failed-connect.hide').clone();
const credentialsValue = card => card.find('.credentials').val().trim();
const eraseCredentials = card => card.find('.credentials').val('');
const errorDelayMs = 1000;
const hideCard = card => card.collapse('hide');
const removeFailure = card => card.find('.failure').children().remove();
const setDisabled = (card, n) => card.find('.form-item').prop('disabled', n);
const showFailure = failure => failure.collapse('show');

/** Create handler for submit connect wallet authenticate form

  {
    card: <Connect Wallet Card Object>
    win: <Window Object>
  }

  @throws
  <Error>

  @returns
  <Handle Submit Connect Function>
*/
module.exports = ({card, win}, cbk) => {
  if (!card) {
    throw new Error('ExpectedConnectWalletCardToGenerateSubmitAction');
  }

  if (!win) {
    throw new Error('ExpectedWindowObjectToGenerateSubmitAction');
  }

  return event => {
    event.preventDefault();

    const credentials = credentialsValue(card);

    if (!credentials) {
      return;
    }

    eraseCredentials(card);

    removeFailure(card);

    setDisabled(card, true);

    return addWallet({credentials, win}, (err, res) => {
      if (!!err) {
        const failure = cloneFailure(card);

        addFailure(card, failure);

        showFailure(failure);

        return setTimeout(() => setDisabled(card, false), errorDelayMs);
      } else {
        hideCard(card);

        return cbk(null, {
          wallets: [{lnd: res.lnd, url: res.url}],
          url: res.url,
        });
      }
    });
  };
};
