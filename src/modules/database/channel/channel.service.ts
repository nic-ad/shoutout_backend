import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Channel } from './channel.entity';
import { CHANNEL_REPOSITORY } from '../constants';
import CreateChannelDto from './dto/createChannel.dto';

@Injectable()
export class ChannelService {
  constructor(
    @Inject(CHANNEL_REPOSITORY)
    private channelRepository: Repository<Channel>,
  ) {}

  async getChannel(channelData: CreateChannelDto): Promise<Channel> {
    const channel = await this.channelRepository.findOne({ where: { ...channelData } });

    if(channel){
      return Promise.resolve(channel);
    }

    return this.channelRepository.save({ ...channelData });
  }

  async findAll(): Promise<Channel[]> {
    return this.channelRepository.find();
  }
}