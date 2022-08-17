// Ask Danny Kim for an invite to shoutout-errors! If you need to change the
// channel that errors are sent to, simply change the channel ID below!
const CHANNEL = 'C03KJCMQSP9';

/**
 * @param {Object} error
 * @param {Object} client
 */
export default function handleError(error, client): void {
  console.error(error);
  client.chat.postMessage({
    channel: CHANNEL,
    text: `
      Shoutout Trigger: ${process.env.SHOUTOUT_PATTERN}
      ENV: ${process.env.NODE_ENV}
      Error: \`\`\`${error.stack}\`\`\``,
  });
}
