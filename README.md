# shoutout_backend

The backend code that gathers Slack messages containing shoutout of Depsters

## Setup

1. Get secrets from Danny Kim on Slack
   (If Danny is unavailable, Jesse Streb has the secrets)
1. Copy the contents of `.env.example` into a new file named `.env`, and fill it out with the secrets
1. Install and run [MongoDB](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/)
1. Run `docker-compose up` to get local postgres DB up and running (first step towards replacing MongoDB)
1. Install dependencies with `npm install`
1. Add @Peakon-test on Slack to a channel with the #test- prefix (Danny can invite you to #peakon-test-channel)
1. Run `node bin/syncBamboo.js` to populate your database

## Running the Slack bot

1. Start the app with `node app.js`
1. Say "shoutout @Peakon-test" in the test channel
   - Case insensitive
   - Must have at least one recipient
1. Say "log people" in the test channel
   - Case sensitive
1. Say "log messages" in the test channel
   - Case sensitive

### Local development workflow

When starting your local app, a websocket connection is established between your app and the Slack bot. If multiple connections are established due to multiple developers are starting their local apps, [https://api.slack.com/apis/connections/socket-implement#connections](there is no guarantee) which local app will receive the events from the Slack bot.

Because of this limitation, [Slack recommends](https://github.com/slackapi/bolt-python/issues/548#issuecomment-994110673) creating a separate copy of the app for each developer working on the project. In your `.env` file, you will find variations of the `LOG_PATTERN` and `TEST_PATTERN` keys that will make sure your test shoutout messages go to the intended local server.

## Running the web API

1. Start the server with `node web`. To start it in watch mode (listens for changes), run `npm install nodemon -g --force ` then `nodemon web`.
2. To see the swagger documentation, hit http://localhost:3001/api-docs in your favorite browser.
