import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChannelModule } from './modules/database/channel/channel.module';
import { ElementsModule } from './modules/database/elements/elements.module';
import { MessageModule } from './modules/database/message/message.module';
import { ProfileModule } from './modules/api/profile/profile.module';
import { ShoutoutsModule } from './modules/api/shoutouts/shoutouts.module';
import { DatabaseModule } from './modules/database/database.module';
import { SlackModule } from './slack/slack.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ChannelModule,
    ElementsModule,
    MessageModule,
    ProfileModule,
    ShoutoutsModule,
    SlackModule,
  ],
})
export class AppModule {}
