import { DataSource } from 'typeorm';

import { DATA_SOURCE, MESSAGE_REPOSITORY } from '../constants';
import { Message } from './message.entity';

export const messageProviders = [
  {
    provide: MESSAGE_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Message),
    inject: [DATA_SOURCE],
  },
];
