import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { messageProviders } from 'src/database/modules/message/message.providers';
import { personProviders } from 'src/database/modules/person/person.providers';
import { HelperService } from '../helper.service';
import { ShoutoutsController } from './shoutouts.controller';
import { ShoutoutsService } from './shoutouts.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ShoutoutsController],
  providers: [...messageProviders, ...personProviders, HelperService, ShoutoutsService],
})
export class ShoutoutsModule {}
