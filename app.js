const { App } = require("@slack/bolt");
require("dotenv").config();

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  // Socket Mode doesn't listen on a port, but in case you want your app to respond to OAuth,
  // you still need to listen on some port!
  port: process.env.PORT || 3000,
});

// Listens to incoming messages that contain "shoutout"
app.message("shoutout", async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  try {
    const sender = `<@${message.user}>`;
    const matches = message.text.matchAll(/<@[0-9A-Z]{11}>/g);
    const recipients = Array.from(matches, (m) => m[0]);
    say(`Sender: ${sender}, Recipients: ${recipients}`);
    console.log(message);
  } catch (error) {
    console.log(error);
  }
});

(async () => {
  // Start your app
  await app.start();

  console.log("⚡️ Bolt app is running!");
})();
