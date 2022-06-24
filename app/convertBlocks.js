async function fetchRecipient(slackClient, slackId, cache = {}) {
  if (slackId in cache) {
    return cache[slackId];
  }
  const { user } = await slackClient.users.info({ user: slackId });
  cache[slackId] = user;
  return user;
}

async function convertBlocks({ blocks, client }) {
  const outputElements = [];
  const uniqueUsers = {};
  while (blocks.length) {
    const block = blocks.shift();
    if (block.elements) {
      blocks.push(...block.elements);
      continue;
    }
    switch (block.type) {
      case "user": {
        const recipient = await fetchRecipient(
          client,
          block.user_id,
          uniqueUsers
        );
        outputElements.push({
          text: recipient.profile.display_name,
          type: block.type,
        });
        break;
      }
      default:
        outputElements.push(block);
    }
  }
  return {
    elements: outputElements,
    users: Object.values(uniqueUsers),
  };
}

module.exports = { convertBlocks };
