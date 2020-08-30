const networks = {bitcoin: 'btc', testnet: 'btctestnet'};

/** Determine if a chain formatted network name matches a regular network name

  {
    chain: <Chain Network Name String>
    network: <Regular Network Name String>
  }

  @returns
  <Is Match Bool>
*/
module.exports = ({chain, network}) => {
  if (!chain) {
    return false;
  }

  if (!network) {
    return false;
  }

  return networks[chain] == network;
};
