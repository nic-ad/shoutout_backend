import { Module } from '@nestjs/common';
import { ShoutoutsController } from './shoutouts.controller';
import { ShoutoutsService } from './shoutouts.service';

@Module({
  controllers: [ShoutoutsController],
  providers: [ShoutoutsService],
})
export class ShoutoutsModule {}
