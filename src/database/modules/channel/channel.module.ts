import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database.module';
import { channelProviders } from './channel.providers';
import { ChannelService } from './channel.service';

@Module({
  imports: [DatabaseModule],
  providers: [...channelProviders, ChannelService],
})
export class ChannelModule {}
