import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/modules/database/database.module';
import { messageProviders } from 'src/modules/database/message/message.providers';
import { personProviders } from 'src/modules/database/person/person.providers';
import { HelperService } from '../helper.service';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ProfileController],
  providers: [
    ...personProviders,
    ...messageProviders,
    HelperService,
    ProfileService,
  ],
})
export class ProfileModule {}
