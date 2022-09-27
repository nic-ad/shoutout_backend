import { logError } from './logger';

type ConvertedBlocks = {
  elements: Element[];
  users: any[];
};

type Element = {
  type: string;
  text?: string;
  elements?: Element[];
  slackUser?: any;
  subtype?: string;
};

async function fetchRecipient(slackClient, slackId, cache = {}): Promise<any> {
  try {
    if (slackId in cache) {
      return cache[slackId];
    }
    const { user } = await slackClient.users.info({ user: slackId });
    cache[slackId] = user;
    return user;
  } catch (error) {
    logError(error, slackClient);
  }
}

export default async function convertBlocks({
  blocks,
  client,
  uniqueUsers = {},
}): Promise<ConvertedBlocks> {
  try {
    const outputElements: Element[] = [];

    while (blocks.length) {
      const block = blocks.shift();

      switch (block.type) {
        case 'rich_text': {
          blocks.unshift(...block.elements);
          break;
        }
        case 'rich_text_list':
        case 'rich_text_section': {
          const { elements } = await convertBlocks({
            blocks: block.elements,
            client,
            uniqueUsers,
          });

          const outputElement = {
            elements,
            type: block.type,
            subtype: '',
          };

          if (block.style) {
            outputElement.subtype = block.style;
          }

          outputElements.push(outputElement);
          break;
        }
        case 'user': {
          const recipient = await fetchRecipient(client, block.user_id, uniqueUsers);

          outputElements.push({
            text: recipient.profile.display_name || recipient.real_name,
            type: block.type,
            slackUser: recipient,
          });

          break;
        }
        case 'emoji': {
          outputElements.push({
            ...block,
            text: block.unicode || block.name,
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
  } catch (error) {
    logError(error, client);
  }
}
