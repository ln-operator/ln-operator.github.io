const {getNode} = require('lightning/lnd_methods');

/** Set an element to an alias
  {
    element: <DOM Element Object>
    id: <Node Public Key Hex String>
    lnd: <Authenticated LND API Object>
  }
*/
module.exports = ({element, id, lnd}) => {
  if (!element) {
    throw new Error('ExpectedElementToSetNodeAlias');
  }

  if (!id) {
    throw new Error('ExpectedIdToSetNodeAlias');
  }

  if (!lnd) {
    throw new Error('ExpectedLndToSetNodeAlias');
  }

  return getNode({
    lnd,
    is_omitting_channels: true,
    public_key: id,
  },
  (err, res) => {
    if (!!err || !res.alias.trim()) {
      return;
    }

    return element.text(res.alias);
  });
};
