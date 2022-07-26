import { DataSource } from 'typeorm';
import { Channel } from './channel.entity';
import { CHANNEL_REPOSITORY, DATA_SOURCE } from '../constants';

export const channelProviders = [
  {
    provide: CHANNEL_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Channel),
    inject: [DATA_SOURCE],
  },
];
