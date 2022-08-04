import { App, ExpressReceiver } from '@slack/bolt';
import { Injectable } from '@nestjs/common';
import { Application } from 'express';
import { convertBlocks } from '../../utils/convertBlocks';
import { handleError } from '../../utils/handleError';
import { ChannelService } from '../modules/database/channel/channel.service';
import { MessageService } from '../modules/database/message/message.service';
import { PersonService } from '../modules/database/person/person.service';

@Injectable()
export class SlackService {
  private boltApp: App;
  private readonly receiver: ExpressReceiver;

  constructor(
    private channelService: ChannelService,
    private messageService: MessageService,
    private personService: PersonService,
  ) {
    this.receiver = new ExpressReceiver({
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      endpoints: '/', // Defaults to /slack/events. We already scoped it in main.ts to /slack/events.
    });

    this.boltApp = new App({
      appToken: process.env.SLACK_APP_TOKEN,
      token: process.env.SLACK_BOT_TOKEN,
      // For local development, comment out 'receiver' line and include socketMode line
      receiver: this.receiver,
      // socketMode: true,
    });

    const shoutoutExpression = new RegExp(process.env.SHOUTOUT_PATTERN, 'i');
    const logExpression = new RegExp(`^${process.env.LOG_PATTERN}$`, 'i');
    this.boltApp.message(shoutoutExpression, this.handleMessage.bind(this));
    this.boltApp.message(logExpression, this.handleLogMessage.bind(this));

    // For local development, uncomment this.boltApp.start()
    // this.boltApp.start()

    // Explanation:
    // 'socketMode' is particularly useful for local development. we'll turn it off in staging
    // but the reason we have to have both this.receiver and this.boltApp is that you can't
    // have a custom receiver while using socketMode. Otherwise, it should look like this:

    // this.receiver = new ExpressReceiver({
    //   signingSecret: process.env.SLACK_SIGNING_SECRET,
    // });

    // this.boltApp = new App({
    //   appToken: process.env.SLACK_APP_TOKEN,
    //   token: process.env.SLACK_BOT_TOKEN,
    //   receiver: this.receiver,
    // });

    // finally, this.boltApp.start() is used to actually make the connection. Not sure how this will
    // work after turning socketMode off, but it's worth noting here. All of the above feels hacky
  }

  async fetchChannelNameBySlackId(slackId) {
    try {
      const info = await this.boltApp.client.conversations.info({
        channel: slackId,
      });
      return info?.channel?.name;
    } catch (error) {
      handleError(error, this.boltApp.client);
    }
  }

  async handleLogMessage({ say }) {
    try {
      console.log(say);
      // const messages = await Message.find().exec();
      // say('```' + JSON.stringify(messages) + '```');
    } catch (error) {
      handleError(error, this.boltApp.client);
    }
  }

  async handleMessage({ client, message }) {
    try {
      const authorInfo = await client.users.info({ user: message.user });
      const author = await this.personService.findPersonAndUpdateImage(authorInfo.user);

      const { elements, users } = await convertBlocks({
        blocks: message.blocks,
        client,
      });

      const promises = users.map((user) => this.personService.findPersonAndUpdateImage(user));
      let recipients = await Promise.all(promises);
      recipients = recipients.filter(Boolean).map((recipient) => recipient.employeeId);
      // const recipientIds = recipients.map((recipient) => recipient.employeeId);

      const channelName = await this.fetchChannelNameBySlackId(message.channel);
      const newChannel = await this.channelService.create({
        name: channelName,
        slackId: message.channel,
      });

      if (recipients.length) {
        await this.messageService.create({
          authorId: author.employeeId,
          channel: newChannel,
          elements: elements,
          recipients: recipients,
          text: message.text,
        });
      }
    } catch (error) {
      console.log('Error in slack.service: handleMessage');
      console.log(error);
      handleError(error, this.boltApp.client);
    }
  }

  use(): Application {
    return this.receiver.app;
  }
}
