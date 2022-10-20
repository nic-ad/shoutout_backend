import { Module } from '@nestjs/common';
import { AlgoliaService } from 'src/modules/algolia/algolia.service';
import { DatabaseModule } from 'src/modules/database/database.module';
import { messageProviders } from 'src/modules/database/message/message.providers';
import { personProviders } from 'src/modules/database/person/person.providers';
import { SkillsProvider } from 'src/modules/database/skills/skills.providers';

import { HelperService } from '../helper.service';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SkillsController],
  providers: [
    ...personProviders,
    ...messageProviders,
    SkillsProvider,
    SkillsService,
    AlgoliaService,
    HelperService,
  ],
})
export class SkillsModule {}
