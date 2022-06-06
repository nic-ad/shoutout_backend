// TODO: Reduce database calls
// FIXME: Rename "test" database
// TODO: Extract subroutines into functions
// TODO: See if the two awaits at the bottom can be combined or something
const mongoose = require("mongoose");
const { App } = require("@slack/bolt");
require("dotenv").config();

const personSchema = new mongoose.Schema({ slack_id: String });
const Person = mongoose.model("Person", personSchema);

const messageSchema = new mongoose.Schema({
  author: personSchema,
  text: String,
  recipients: [personSchema],
});
const Message = mongoose.model("Message", messageSchema);

// Initializes your app with your bot token and signing secret
const app = new App({
  appToken: process.env.SLACK_APP_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  token: process.env.SLACK_BOT_TOKEN,
  // Socket Mode doesn't listen on a port, but in case you want your app to respond to OAuth,
  // you still need to listen on some port!
  port: process.env.PORT || 3000,
});

// Listens to incoming messages that contain "shoutout"
app.message("shoutout", async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  try {
    const author_id = message.user;
    const matches = message.text.matchAll(/<@([0-9A-Z]{11})>/g);
    if (matches.length === 0) throw new Error("Shoutouts must have recipients");
    const recipient_ids = Array.from(matches, (m) => m[1]);

    [author_id, ...recipient_ids].forEach(
      async (slack_id) =>
        (await Person.findOne({ slack_id }).exec()) ||
        new Person({ slack_id }).save()
    );

    const author = await Person.findOne({ slack_id: message.user }).exec();
    const recipients = recipient_ids.map(
      async (slack_id) => await Person.findOne({ slack_id }).exec()
    );
    new Message({ author, recipients, text: message.text }).save()
    const messages = await Message.find().exec();
    say(JSON.stringify(messages));
  } catch (error) {
    console.log(error);
  }
});

(async () => {
  // Start your app
  await app.start();
  await mongoose.connect("mongodb://localhost:27017/test");

  console.log("⚡️ Bolt app is running!");
})();
