import { DataSource } from 'typeorm';
import { Person } from './person.entity';
import { PERSON_REPOSITORY, DATA_SOURCE } from '../constants';

export const personProviders = [
  {
    provide: PERSON_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Person),
    inject: [DATA_SOURCE],
  },
];
