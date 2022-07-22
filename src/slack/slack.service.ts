import { App, ExpressReceiver } from '@slack/bolt';
import { AppService } from '../app.service';
import { Injectable } from '@nestjs/common';
import { Application } from 'express';
import { convertBlocks } from '../../utils/convertBlocks';
import { handleError } from '../../utils/handleError';
import { MessageService } from '../database/modules/message/message.service';
import { Message } from 'src/database/modules/message/message.entity';

@Injectable()
export class SlackService {
  private boltApp: App;
  private readonly receiver: ExpressReceiver;

  constructor(private appService: AppService) {
    this.receiver = new ExpressReceiver({
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      endpoints: '/' // Defaults to /slack/events. We already scoped it in main.ts to /slack/events.
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
    this.boltApp.message(shoutoutExpression, this.handleMessage);
    this.boltApp.message(logExpression, this.handleLogMessage);
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

  public async fetchChannelNameBySlackId(slackId) {
    try {
      const info = await this.boltApp.client.conversations.info({
        channel: slackId,
      });
      return info?.channel?.name;
    } catch (error) {
      handleError(error, this.boltApp.client);
    }
  }

  public async findPersonAndUpdateImage(slackUser) {
    try {
      console.log(slackUser);
      // const queryConditions = [{ name: slackUser?.real_name }];
      // if (slackUser?.profile?.email) {
      //   queryConditions.push({
      //     email: slackUser?.profile?.email,
      //   });
      // }
      // const conditions = { $or: queryConditions };
      // const update = {
      //   image72: slackUser?.profile?.image_72,
      //   image192: slackUser?.profile?.image_192,
      //   image512: slackUser?.profile?.image_512,
      // };
      // const person = await Person.findOneAndUpdate(conditions, update);
      // return person?._id;
    } catch (error) {
      handleError(error, this.boltApp.client);
    }
  }

  public async handleLogMessage({ say }) {
    try {
      console.log(say);
      // const messages = await Message.find().exec();
      // say('```' + JSON.stringify(messages) + '```');
    } catch (error) {
      handleError(error, this.boltApp.client);
    }
  }

  public async handleMessage({ client, message }) {
    try {
      console.log(client);
      console.log(message);
      // const authorInfo = await client.users.info({ user: message.user });
      // const author = await this.findPersonAndUpdateImage(authorInfo.user);

      // const { elements, users } = await convertBlocks({
      //   blocks: message.blocks,
      //   client,
      // });
      // const promises = users.map(this.findPersonAndUpdateImage);
      // let recipients = await Promise.all(promises);
      // recipients = recipients.filter(Boolean);

      // const channelName = await this.fetchChannelNameBySlackId(message.channel);

      // if (recipients.length) {
      //   MessageService.
      //   .create({
      //     author: author,
      //     channel: { name: channelName, slackId: message.channel },
      //     elements: elements,
      //     recipients: recipients,
      //     text: message.text,
      //   });
      // }
    } catch (error) {
      handleError(error, this.boltApp.client);
    }
  }

  public use(): Application {
    return this.receiver.app;
  }
}
