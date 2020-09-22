const asyncForever = require('async/forever');

const {addCard} = require('./../cards');
const {cardForFailureDetails} = require('./../cards');
const main = require('./main');

const absentNode = $ => $('#node-absent');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const hideConnect = node => node.find('.card.connect-wallet').collapse('hide');
const hideNodes = node => node.find('.node-container').prop('hidden', true);
const restartTimeoutMs = 1000 * 30;

/** Start application

  {
    win: <Window Object>
  }
*/
module.exports = async ({win}) => {
  const node = absentNode(win.jQuery);

  return await asyncForever(async () => {
    hideConnect(node);

    try {
      return await main({win});
    } catch (err) {
      hideNodes(node);

      addCard({node, card: cardForFailureDetails({err, node}).card});

      return await delay(restartTimeoutMs);
    }
  });
};
