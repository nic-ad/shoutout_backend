import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AlgoliaModule } from './modules/algolia/algolia.module';
import { ProfileModule } from './modules/api/profile/profile.module';
import { ShoutoutsModule } from './modules/api/shoutouts/shoutouts.module';
import { SkillsModule as SkillsApi } from './modules/api/skills/skills.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChannelModule } from './modules/database/channel/channel.module';
import { DatabaseModule } from './modules/database/database.module';
import { ElementsModule } from './modules/database/elements/elements.module';
import { MessageModule } from './modules/database/message/message.module';
import { SkillsModule as SkillsDatabase } from './modules/database/skills/skills.module';
import { SlackModule } from './slack/slack.module';

@Module({
  imports: [
    AlgoliaModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ChannelModule,
    ElementsModule,
    MessageModule,
    ProfileModule,
    ShoutoutsModule,
    SkillsApi,
    SkillsDatabase,
    SlackModule,
  ],
})
export class AppModule {}
