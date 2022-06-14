const mongoose = require("mongoose");
const { App } = require("@slack/bolt");
const { Person, Message } = require("./models");
require("dotenv").config();

const app = new App({
  appToken: process.env.SLACK_APP_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  token: process.env.SLACK_BOT_TOKEN,
});

/**
 * FIXME: if you shoutout yourself, you get added to the database twice
 * @param {string} slackId
 * @returns {Object | undefined} mongoose.Types.ObjectId
 */
async function findPersonBySlackId(slackId) {
  const info = await app.client.users.info({ user: slackId })
  const email = info?.user?.profile?.email;
  const person = await Person.findOne({ email })
  return person?._id
}

/**
 * @param {Object[]} blocks
 * @returns {string[]} Array of Slack user_id strings
 */
function searchBlocksForUsers(blocks) {
  const users = new Set()
  while (blocks.length) {
    const block = blocks.shift()
    if (block.type === "user") {
      users.add(block.user_id)
    } else if (block.elements) {
      blocks.push(...block.elements)
    }
  }
  return Array.from(users)
}

/**
 * @param {string[]} slackIds
 * @returns {Object[]} mongoose.Types.ObjectId[]
 */
async function findRecipients(slackIds) {
  const personMongoIds = []
  for (let i=0; i<slackIds.length; i++) {
    const mongoId = await findPersonBySlackId(slackIds[i])
    if (mongoId) {
      personMongoIds.push(mongoId)
    }
  }
  return personMongoIds
}

// Adding this for testing purposes so that I don't need to keep sending slack messages
async function handleMessage({ message }) {
  try {
    const author = await findPersonBySlackId(message.user);
    const slackIds = searchBlocksForUsers(message.blocks)
    const recipients = await findRecipients(slackIds);
    if (recipients.length) {
      Message.create({ author: author, recipients: recipients, text: message.text });
    }
  } catch (error) {
    console.error(error);
  }
} 

// Listens to incoming messages that contain "shoutout"
app.message(/shoutout/i, handleMessage);

app.message("log messages", async ({ say }) => {
  const messages = await Message.find().exec();
  say(`\`\`\`${JSON.stringify(messages, null, 2)}\`\`\``);
});

app.message("log people", async ({ say }) => {
  const people = await Person.find().exec();
  say(`\`\`\`${JSON.stringify(people, null, 2)}\`\`\``);
});

// Start your app
app.start();
mongoose.connect(process.env.MONGO_URI);

// For development reasons.
/*
handleMessage({
  user: "UGX5U6QHL",
  blocks: [
    {
      type: "rich_text",
      block_id: "Uqr3f",
      elements: [
        {
          type: "rich_text_section",
          elements: [
            { type: "text", text: "shoutout " },
            { type: "user", user_id: "U03HQDQ90A0" },
          ],
        },
      ],
    },
  ],
});
*/
