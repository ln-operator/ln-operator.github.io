const EventEmitter = require('events');

const {decodeFirst} = require('cbor');
const {encodeAsync} = require('cbor');
const wsUrl = require('lightning/lnd_gateway/ws_url');

const {servers} = require('./constants');

const {keys} = Object;

/** Generate a LND gateway client interface object

  {
    macaroon: <Macaroon Authentication String>
    url: <Gateway Endpoint URL String>
  }

  @returns
  {
    lnd: <Authenticated LND API Object>
  }
*/
module.exports = ({macaroon, url}) => {
  const lnd = keys(servers).reduce((sum, server) => {
    // Setup standard methods
    sum[server] = keys(servers[server]).reduce((sum, method) => {
      if (!servers[server][method].responseStream) {
        sum[method] = async (args, cbk) => {
          try {
            const encoded = await fetch(`${url}${server}/${method}`, {
              body: await encodeAsync(args),
              headers: {
                'authorization': `Bearer ${macaroon}`,
                'content-type': 'application/cbor',
              },
              method: 'POST',
            });

            const response = await encoded.arrayBuffer();

            return decodeFirst(Buffer.from(response), (err, decoded) => {
              if (!!err) {
                return cbk([503, 'FailedToDecodeLndResponseCbor', {err}]);
              }

              return cbk(decoded.err, decoded.res);
            });
          } catch (err) {
            return cbk(err);
          }
        };
      } else {
        sum[method] = args => {
          const eventEmitter = new EventEmitter();
          const socket = new WebSocket(wsUrl({url}).url);

          socket.binaryType = 'arraybuffer';

          eventEmitter.cancel = () => {};

          socket.onopen = async () => {
            const request = await encodeAsync({
              macaroon,
              method,
              server,
              params: args,
            });

            return socket.send(request);
          };

          socket.onmessage = message => {
            return decodeFirst(Buffer.from(message.data), (err, res) => {
              if (!!err) {
                return eventEmitter.emit(
                  'error',
                  new Error('FailedToDecodeRes')
                );
              }

              return eventEmitter.emit(res.event, res.data);
            });
          }

          socket.onclose = () => eventEmitter.emit('end');

          socket.onerror = err => {
            return eventEmitter.emit('error', 'GotWebSocketError');
          };

          return eventEmitter;
        };
      }

      return sum;
    },
    {});

    return sum;
  },
  {});

  return {lnd};
};
