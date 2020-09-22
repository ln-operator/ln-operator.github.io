const clone = require('./clone');

const closeEvent = n => n.find('.close').on('click', () => n.collapse('hide'));
const defaultFailure = 'UnknownFailureReason';
const failureDetails = card => card.find('.failure-details');
const {isArray} = Array;
const setDescription = (card, n) => card.find('.failure-description').text(n);
const setFailureCode = (card, code) => card.find('.failure-code').text(code);
const setFailureMessage = (card, n) => card.find('.failure-message').text(n);
const setHidden = (element, isHidden) => element.prop('hidden', isHidden);
const setTitle = (card, title) => card.find('.failure-title').text(title);
const {stringify} = JSON;
const template = '.card.failure-details';

/** Failure card

  {
    [description]: <Error Description String>
    [err]: [
      <Error Code Number>
      <Error Type String>
    ]
    node: <Node Container Object>
    [title]: <Error Title String>
  }

  @returns
  {
    card: <Card DOM Object>
  }
*/
module.exports = ({description, err, node, title}) => {
  if (!node) {
    throw new Error('ExpectedNodeContainerToGenerateCardForFailure');
  }

  const card = clone({node, template});

  const failure = failureDetails(card);

  closeEvent(card);

  if (!!description) {
    setDescription(card, description);
  }

  if (!!title) {
    setTitle(card, title);
  }

  const [code, message, details] = !!isArray(err) ? err : [];

  failure.val(stringify(details || {}));
  setFailureCode(card, code || Number());
  setFailureMessage(card, message || defaultFailure);
  setHidden(failure, !details);

  return {card};
};
