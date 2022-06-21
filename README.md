# shoutout\_backend

The backend code that gathers Slack messages containing shoutout of Depsters

## Setup

1. Get secrets from Danny Kim on Slack
   (If Danny is unavailable, Jesse Streb has the secrets)
1. Copy the contents of `.env.example` into a new file named `.env`, and fill it out with the secrets
1. Install and run [MongoDB](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/)
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

## Running the web API

1. Start the server with `node web`.  To start it in watch mode (listens for changes), run `npm install nodemon -g --force
` then `nodemon web`.
2. To see the swagger documentation, hit http://localhost:3001/api-docs in your favorite browser.
