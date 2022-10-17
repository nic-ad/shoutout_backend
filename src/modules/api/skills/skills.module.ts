import { Module } from '@nestjs/common';
import { AlgoliaService } from 'src/modules/algolia/algolia.service';
import { DatabaseModule } from 'src/modules/database/database.module';
import { personProviders } from 'src/modules/database/person/person.providers';

import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SkillsController],
  providers: [...personProviders, SkillsService, AlgoliaService],
})
export class SkillsModule {}
