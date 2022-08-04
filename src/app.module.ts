import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PersonModule } from './modules/database/person/person.module';
import { ChannelModule } from './modules/database/channel/channel.module';
import { ElementsModule } from './modules/database/elements/elements.module';
import { MessageModule } from './modules/database/message/message.module';
import { ProfileModule } from './modules/api/profile/profile.module';
import { ShoutoutsModule } from './modules/api/shoutouts/shoutouts.module';
import { SlackService } from './slack/slack.service';
import { messageProviders } from './modules/database/message/message.providers';
import { DatabaseModule } from './modules/database/database.module';
import { MessageService } from './modules/database/message/message.service';
import { PersonService } from './modules/database/person/person.service';
import { personProviders } from 'src/modules/database/person/person.providers';
import { SlackModule } from './slack/slack.module';
import { ChannelService } from './modules/database/channel/channel.service';
import { channelProviders } from './modules/database/channel/channel.providers';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ChannelModule,
    ElementsModule,
    MessageModule,
    ProfileModule,
    ShoutoutsModule,
    SlackModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ChannelService,
    ...channelProviders,
    MessageService,
    ...messageProviders,
    PersonService,
    ...personProviders,
    SlackService,
  ],
})
export class AppModule {}
