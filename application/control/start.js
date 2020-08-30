const asyncForever = require('async/forever');

const {addCard} = require('./../cards');
const {cardForFailureDetails} = require('./../cards');
const main = require('./main');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const hideCards = $ => $('.card').collapse('hide');
const hideConnect = $ => $('.connect-wallet').collapse('hide');
const restartTimeoutMs = 1000 * 30;

/** Start application

  {
    win: <Window Object>
  }
*/
module.exports = async ({win}) => {
  return await asyncForever(async () => {
    hideConnect(win.jQuery);

    try {
      return await main({win});
    } catch (err) {
      hideCards(win.jQuery);

      const {card} = cardForFailureDetails({err, win});

      addCard({card, win});

      return await delay(restartTimeoutMs);
    }
  });
};
