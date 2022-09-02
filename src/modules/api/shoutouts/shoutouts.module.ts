import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/modules/database/database.module';
import { elementsProviders } from 'src/modules/database/elements/elements.providers';
import { messageProviders } from 'src/modules/database/message/message.providers';
import { personProviders } from 'src/modules/database/person/person.providers';

import { HelperService } from '../helper.service';
import { ShoutoutsController } from './shoutouts.controller';
import { ShoutoutsService } from './shoutouts.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ShoutoutsController],
  providers: [
    ...messageProviders,
    ...personProviders,
    ...elementsProviders,
    HelperService,
    ShoutoutsService,
  ],
})
export class ShoutoutsModule {}
