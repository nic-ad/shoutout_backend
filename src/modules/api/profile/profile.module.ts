import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { messageProviders } from 'src/database/modules/message/message.providers';
import { personProviders } from 'src/database/modules/person/person.providers';
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
