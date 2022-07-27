// Ask Danny Kim for an invite to shoutout-errors! If you need to change the
// channel that errors are sent to, simply change the channel ID below!
const CHANNEL = 'C03KJCMQSP9';

/**
 * @param {Object} error
 * @param {Object} client
 */
function handleError(error, client) {
  console.error(error);
  client.chat.postMessage({
    channel: CHANNEL,
    text: '```' + error.stack + '```',
  });
}

module.exports = { handleError };
