import { DataSource } from 'typeorm';

import { DATA_SOURCE, PERSON_REPOSITORY } from '../constants';
import { Person } from './person.entity';

export const personProviders = [
  {
    provide: PERSON_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Person),
    inject: [DATA_SOURCE],
  },
];
