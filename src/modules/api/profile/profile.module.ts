import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/modules/database/database.module';
import { elementsProviders } from 'src/modules/database/elements/elements.providers';
import { messageProviders } from 'src/modules/database/message/message.providers';
import { personProviders } from 'src/modules/database/person/person.providers';
import { SkillsProvider } from 'src/modules/database/skills/skills.providers';

import { HelperService } from '../helper.service';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ProfileController],
  providers: [
    ...personProviders,
    ...messageProviders,
    ...elementsProviders,
    HelperService,
    ProfileService,
    SkillsProvider,
  ],
})
export class ProfileModule {}
