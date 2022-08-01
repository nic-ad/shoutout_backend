import { Module } from '@nestjs/common';
import { messageProviders } from '../modules/database/message/message.providers';
import { DatabaseModule } from '../modules/database/database.module';
import { MessageService } from '../modules/database/message/message.service';
import { PersonService } from '../modules/database/person/person.service';
import { personProviders } from 'src/modules/database/person/person.providers';
import { SlackService } from './slack.service';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [...personProviders, ...messageProviders, MessageService, PersonService, SlackService],
})
export class SlackModule {}
