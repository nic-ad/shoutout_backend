import { App, ExpressReceiver } from '@slack/bolt';
import { Inject, Injectable } from '@nestjs/common';
import { Application } from 'express';
import convertBlocks from '../utils/convertBlocks';
import handleError from '../utils/handleError';
import { ChannelService } from '../modules/database/channel/channel.service';
import { Elements } from '../modules/database/elements/elements.entity';
import { MessageService } from '../modules/database/message/message.service';
import { PersonService } from '../modules/database/person/person.service';

@Injectable()
export class SlackService {
  private boltApp: App;
  private readonly receiver: ExpressReceiver;

  @Inject(ChannelService)
  private readonly channelService: ChannelService;
  @Inject(MessageService)
  private readonly messageService: MessageService;
  @Inject(PersonService)
  private readonly personService: PersonService;

  constructor() {
    this.receiver = new ExpressReceiver({
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      endpoints: '/', // Defaults to /slack/events. We already scoped it in main.ts to /slack/events.
    });

    // Use this definition for local development
    if (process.env.NODE_ENV === 'development') {
      this.boltApp = new App({
        appToken: process.env.SLACK_APP_TOKEN,
        token: process.env.SLACK_BOT_TOKEN,
        signingSecret: process.env.SLACK_SIGNING_SECRET,
        socketMode: true,
      });
    } else {
      this.boltApp = new App({
        appToken: process.env.SLACK_APP_TOKEN,
        token: process.env.SLACK_BOT_TOKEN,
        receiver: this.receiver,
      });
    }

    const shoutoutExpression = new RegExp(`\\b${process.env.SHOUTOUT_PATTERN}(?!-)\\b`, 'i');
    const logExpression = new RegExp(`\\b${process.env.LOG_PATTERN}\\b`, 'i');

    this.boltApp.message(shoutoutExpression, this.handleMessage.bind(this));
    this.boltApp.message(logExpression, this.handleLogMessage.bind(this));

    if (process.env.NODE_ENV === 'development') {
      this.boltApp.start();
    }
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
      const recipients = await Promise.all(promises);
      const recipientIds = recipients.filter(Boolean).map((recipient) => recipient.employeeId);

      const channelName = await this.fetchChannelNameBySlackId(message.channel);
      const channel = await this.channelService.getChannel({
        name: channelName,
        slackId: message.channel,
      });

      if (recipients.length) {
        const messageElements: Elements[] = [];

        for (const element of elements) {
          for (const elementItem of element.elements) {
            const elementEntity = new Elements();
            elementEntity.text = elementItem.text;
            elementEntity.type = elementItem.type;

            if (elementEntity.type === 'user') {
              const person = await this.personService.findPerson(elementItem.slackUser);
              elementEntity.employeeId = person.employeeId;
            }

            messageElements.push(elementEntity);
          }
        }

        await this.messageService.create({
          authorId: author.employeeId,
          channel,
          elements: messageElements,
          recipients: recipientIds,
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
