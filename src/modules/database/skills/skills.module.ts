import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database.module';
import { SkillsProvider } from './skills.providers';
import { SkillsService } from './skills.service';

@Module({
  imports: [DatabaseModule],
  providers: [SkillsProvider, SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
