const mongoose = require("mongoose");
const express = require('express')
const webApp = express()
const port = process.env.PORT || '3001'

webApp.get('/', (req, res) => {
  res.send('Hello World!')
})

webApp.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const { App } = require("@slack/bolt");
const { Person, Message } = require("./models");
require("dotenv").config();

const app = new App({
  appToken: process.env.SLACK_APP_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  token: process.env.SLACK_BOT_TOKEN
});

/**
 * @param {string} slack_id
 * @returns {Object}
 */
async function findOrCreatePerson(slack_id) {
  const person = await Person.findOne({ slack_id }).exec();
  if (person) return person;
  return await Person.create({ slack_id });
}

/**
 * @param {string} messageText
 * @returns {Object[]}
 */
function findOrCreateRecipients(messageText) {
  const matches = messageText.matchAll(/<@([0-9A-Z]{11})>/g);
  const slackIds = Array.from(matches, (m) => m[1]);
  if (slackIds.length === 0) throw new Error("Shoutouts must have recipients");
  return slackIds.map(findOrCreatePerson);
}

// Listens to incoming messages that contain "shoutout"
app.message("shoutout", async ({ message, say }) => {
  console.log('TESTING HEROKU');
  // say() sends a message to the channel where the event was triggered
  try {
    const author = findOrCreatePerson(message.user);
    const recipients = findOrCreateRecipients(message.text);
    Message.create({ author, recipients, text: message.text });
  } catch (error) {
    console.error(error);
  }
  const messages = await Message.find().exec();
  say(`\`\`\`${JSON.stringify(messages, null, 2)}\`\`\``);
});

// Start your app
app.start();
mongoose.connect(process.env.MONGO_URI);
