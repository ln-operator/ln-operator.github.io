/** Request JSON from a URL

  {
    timeout: <Timeout Milliseconds>
    url: <URL String>
    win: <Window Object>
  }

  @returns via cbk
  {
    statusCode: <Status Code Number>
  }
  <JSON Object>
*/
module.exports = async ({timeout, url, win}, cbk) => {
  const controller = new win.AbortController();

  const signal = controller.signal;

  try {
    const request = win.fetch(url, {signal});

    const abort = setTimeout(() => controller.abort(), timeout);

    const response = await request;

    const json = await response.json();

    clearTimeout(abort);

    return cbk(null, {statusCode: response.status}, json);
  } catch (err) {
    return cbk(err);
  }
};
