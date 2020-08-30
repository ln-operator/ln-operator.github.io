const clickEvent = 'click';
const hopCount = item => item.find('.hop-count');
const probingRouteItem = card => card.find('.probing-route.template').clone();
const removeTemplate = item => item.removeClass('template');
const routeFee = item => item.find('.route-fee');
const routeHops = item => item.find('.hops');
const setHidden = (element, hidden) => element.prop('hidden', hidden);
const toggle = element => element.collapse('toggle');
const toggleActive = element => element.toggleClass('active');
const tokensAsBigToken = tokens => (tokens / 1e8).toFixed(8);
const totalRoutingFee = item => item.find('.total-routing-fee');

/** List item for probing route

  {
    card: <Card Object>
    fee: <Fee Tokens Number>
    hops: <Hops Count Number>
  }

  @returns
  {
    item: <List Item Object>
  }
*/
module.exports = ({card, fee, hops}) => {
  const item = probingRouteItem(card);

  hopCount(item).text(hops);
  removeTemplate(item);
  routeFee(item).text(tokensAsBigToken(fee));
  setHidden(item, false);

  totalRoutingFee(item).on(clickEvent, () => {
    toggle(routeHops(item));
    toggleActive(totalRoutingFee(item));

    return;
  });

  return {item};
};
