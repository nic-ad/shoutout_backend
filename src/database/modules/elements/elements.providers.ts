import { DataSource } from 'typeorm';
import { Elements } from './elements.entity';
import { ELEMENTS_REPOSITORY, DATA_SOURCE } from '../../constants';

export const elementsProviders = [
  {
    provide: ELEMENTS_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Elements),
    inject: [DATA_SOURCE],
  },
];
