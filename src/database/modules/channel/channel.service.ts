import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Channel } from './channel.entity';
import { CHANNEL_REPOSITORY } from '../../constants';

@Injectable()
export class ChannelService {
  constructor(
    @Inject(CHANNEL_REPOSITORY)
    private channelRepository: Repository<Channel>,
  ) {}

  async findAll(): Promise<Channel[]> {
    return this.channelRepository.find();
  }
}
