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

  async create(channelData: CreateChannelDto): Promise<Channel> {
    const newChannel = await this.channelRepository.create({
      slackId: channelData.slackId,
      name: channelData.name,
    });
    return this.channelRepository.save(newChannel);
  }

  async findAll(): Promise<Channel[]> {
    return this.channelRepository.find();
  }
}
