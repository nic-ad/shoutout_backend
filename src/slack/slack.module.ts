import { Module } from '@nestjs/common';
import { messageProviders } from '../modules/database/message/message.providers';
import { DatabaseModule } from '../modules/database/database.module';
import { ChannelService } from '../modules/database/channel/channel.service';
import { MessageService } from '../modules/database/message/message.service';
import { PersonService } from '../modules/database/person/person.service';
import { personProviders } from 'src/modules/database/person/person.providers';
import { SlackService } from './slack.service';
import { channelProviders } from 'src/modules/database/channel/channel.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [
    ...channelProviders,
    ...personProviders,
    ...messageProviders,
    ChannelService,
    MessageService,
    PersonService,
    SlackService,
  ],
})
export class SlackModule {}
