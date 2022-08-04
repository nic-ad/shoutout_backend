import { Module } from '@nestjs/common';
import { DatabaseModule } from '../modules/database/database.module';
import { ChannelModule } from '../modules/database/channel/channel.module';
import { MessageModule } from '../modules/database/message/message.module';
import { PersonModule } from '../modules/database/person/person.module';
import { SlackService } from './slack.service';

@Module({
  imports: [DatabaseModule, PersonModule, ChannelModule, MessageModule],
  providers: [SlackService],
})
export class SlackModule {}
