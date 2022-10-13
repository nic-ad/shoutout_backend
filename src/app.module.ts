import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ProfileModule } from './modules/api/profile/profile.module';
import { ShoutoutsModule } from './modules/api/shoutouts/shoutouts.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChannelModule } from './modules/database/channel/channel.module';
import { DatabaseModule } from './modules/database/database.module';
import { ElementsModule } from './modules/database/elements/elements.module';
import { MessageModule } from './modules/database/message/message.module';
import { SkillsModule } from './modules/database/skills/skills.module';
import { SlackModule } from './slack/slack.module';

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
    SkillsModule,
    SlackModule,
  ],
})
export class AppModule {}
