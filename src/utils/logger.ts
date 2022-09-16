const CHANNEL = 'C03KJCMQSP9';//#peakon-test-channel

/**
 * @param {Object} error
 * @param {Object} client
 */
export function logError(error, client): void {
  console.error(error);
  client.chat.postMessage({
    channel: CHANNEL,
    text: `
      ENV: ${process.env.NODE_ENV}
      \`\`\`${error.stack}\`\`\`
    `,
  });
}

export function logInsertedMessage(params: any): void {
  params.client.chat.postMessage({
    channel: CHANNEL,
    parse: 'full',
    mrkdwn: false,
    text: `
      Successfully inserted message to database:
      *Message ID*: ${params.message.id}
      *Message Date:* ${params.message.createDate}
      *Channel:* ${params.message.channel.name}
    `,
  });
}
