# shoutout_backend

The backend code that gathers Slack messages containing shoutout of Depsters

## Setup

1. Get secrets from Nat Ring or Jesse Streb in Slack.
1. Copy the contents of `.env.example` into a new file named `.env`, and fill it out with the secrets
1. [Install Docker](https://docs.docker.com/get-docker/), make sure it is running, and run `docker-compose up` to get local postgres DB up and running
1. Install dependencies with `npm install`
1. Add @Peakon-test on Slack to a channel with the #test- prefix (Danny can invite you to #peakon-test-channel)
1. First time setup - change .env variable `SYNCHRONIZE` from false to true the first time you start the application for the inital DB schema. After inital setup use migrations to update and set back to false.
1. run `npm start` start the app.
1. To Seed/Update users in your local database by running `npm run seed:users`
1. (For legacy app) Run `node bin/syncBamboo.js` to populate users

## Running the App

1. Start the app with `npm run start`
2. To watch for changes in your files, start the app with `npm run start:dev`
3. Say "shoutout @Peakon-test" in the test channel
   - Case insensitive
   - Must have at least one recipient
4. Say "log people" in the test channel
   - Case sensitive
5. Say "log messages" in the test channel
   - Case sensitive
6. To see the swagger documentation, hit http://localhost:3000/api in your favorite browser.

### Local development workflow

When starting your local app, a websocket connection is established between your app and the Slack bot. If multiple connections are established due to multiple developers are starting their local apps, [https://api.slack.com/apis/connections/socket-implement#connections](there is no guarantee) which local app will receive the events from the Slack bot.

Because of this limitation, [Slack recommends](https://github.com/slackapi/bolt-python/issues/548#issuecomment-994110673) creating a separate copy of the app for each developer working on the project. In your `.env` file, you will find variations of the `LOG_PATTERN` and `TEST_PATTERN` keys that will make sure your test shoutout messages go to the intended local server.

## Database Migrations 
1. Make a change to one of the entities 
1. Run `npm run migration:generate src/modules/database/migrations/NAME_OF_MIGRATION`. (You must include the file path otherwise the migration will get populated in the root directory.)
1. You will see the file generate in the migration folder. Apply to database by runnning `npm run migration:up` and the changes will be reflected in local DB 
1. To revert changes run `npm run migration:revert`
