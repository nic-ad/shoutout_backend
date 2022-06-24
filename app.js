const mongoose = require("mongoose");
const { App } = require("@slack/bolt");
const { Person, Message } = require("./models");
const { convertBlocks } = require("./app/convertBlocks");
require("dotenv").config();

const app = new App({
  appToken: process.env.SLACK_APP_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  token: process.env.SLACK_BOT_TOKEN,
});

/**
 * @param {Object} slackUser https://api.slack.com/types/user
 * @returns {Object | undefined} mongoose.Types.ObjectId
 */
async function findPersonAndUpdateImage(slackUser) {
  const email = slackUser?.profile?.email;
  const update = {
    image72: slackUser?.profile?.image_72,
    image192: slackUser?.profile?.image_192,
    image512: slackUser?.profile?.image_512,
  };
  const person = await Person.findOneAndUpdate({ email }, update);
  return person?._id;
}

/**
 * @param {string} slackId
 * @returns {string | undefined}
 */
async function fetchChannelNameBySlackId(slackId) {
  const info = await app.client.conversations.info({ channel: slackId });
  return info?.channel?.name;
}

/**
 * @param {Object} error
 */
function handleError(error) {
  console.error(error);
  // Ask Danny Kim for an invite to shoutout-errors! If you need to change the
  // channel that errors are sent to, simply change the channel ID below!
  const channel = "C03KJCMQSP9";
  app.client.chat.postMessage({
    channel: channel,
    text: "```" + error.stack + "```",
  });
}

/**
 * @param {Object} payload - https://slack.dev/bolt-js/reference#listener-function-arguments
 */
async function handleMessage({ client, message }) {
  try {
    const authorInfo = await client.users.info({ user: message.user });
    const author = await findPersonAndUpdateImage(authorInfo);

    const { elements, users } = await convertBlocks({
      blocks: message.blocks,
      client,
    });
    const promises = users.map(findPersonAndUpdateImage);
    const recipients = await Promise.all(promises);

    const channelName = await fetchChannelNameBySlackId(message.channel);

    if (recipients.length) {
      Message.create({
        author: author,
        channel: { name: channelName, slackId: message.channel },
        elements: elements,
        recipients: recipients,
        text: message.text,
      });
    }
  } catch (error) {
    handleError(error);
  }
}

// Listens to incoming messages that contain "shoutout"
app.message(/shoutout/i, handleMessage);

app.message("log messages", async ({ say }) => {
  try {
    const messages = await Message.find().exec();
    say("```" + JSON.stringify(messages) + "```");
  } catch (error) {
    handleError(error);
  }
});

app.message("log people", async ({ say }) => {
  try {
    const people = await Person.find().exec();
    say("```" + JSON.stringify(people) + "```");
  } catch (error) {
    handleError(error);
  }
});

app.error(handleError);

// If multiple servers are running app.start, only one of them will work
app.start();
mongoose.connect(process.env.MONGO_URI);

// To test, comment app.start(); and uncomment this
/*
handleMessage({
  message: {
    channel: "C01DZ6T9JPK", // #shoutouts
    user: "UGV3LSE58",
    blocks: [
      {
        type: "rich_text",
        elements: [
          {
            type: "rich_text_section",
            elements: [
              { type: "text", text: "shoutout " },
              { type: "user", user_id: "U02KU2Q34AY" },
            ],
          },
        ],
      },
    ],
  },
});
*/
