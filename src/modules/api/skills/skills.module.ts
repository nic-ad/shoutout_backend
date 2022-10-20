import { Module } from '@nestjs/common';
import { AlgoliaService } from 'src/modules/algolia/algolia.service';
import { DatabaseModule } from 'src/modules/database/database.module';
import { personProviders } from 'src/modules/database/person/person.providers';
import { SkillsProvider } from 'src/modules/database/skills/skills.providers';

import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SkillsController],
  providers: [...personProviders, SkillsProvider, SkillsService, AlgoliaService],
})
export class SkillsModule {}
