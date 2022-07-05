async function fetchRecipient(slackClient, slackId, cache = {}) {
  if (slackId in cache) {
    return cache[slackId];
  }
  const { user } = await slackClient.users.info({ user: slackId });
  cache[slackId] = user;
  return user;
}

async function convertBlocks({ blocks, client, uniqueUsers = {} }) {
  const outputElements = [];
  while (blocks.length) {
    const block = blocks.shift();
    switch (block.type) {
      case "rich_text": {
        blocks.unshift(...block.elements);
        break;
      }
      case "rich_text_list":
      case "rich_text_section": {
        const { elements } = await convertBlocks({
          blocks: block.elements,
          client,
          uniqueUsers,
        });
        const outputElement = {
          elements,
          type: block.type,
        };
        if (block.style) {
          outputElement.subtype = block.style;
        }
        outputElements.push(outputElement);
        break;
      }
      case "user": {
        const recipient = await fetchRecipient(
          client,
          block.user_id,
          uniqueUsers
        );
        outputElements.push({
          text: recipient.profile.display_name || recipient.real_name,
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
