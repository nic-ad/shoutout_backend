import { Module } from '@nestjs/common';
import { ChannelModule } from '../modules/database/channel/channel.module';
import { DatabaseModule } from '../modules/database/database.module';
import { ElementsModule } from '../modules/database/elements/elements.module';
import { MessageModule } from '../modules/database/message/message.module';
import { PersonModule } from '../modules/database/person/person.module';
import { SlackService } from './slack.service';

@Module({
  imports: [DatabaseModule, PersonModule, ChannelModule, MessageModule, ElementsModule],
  providers: [SlackService],
})
export class SlackModule {}
