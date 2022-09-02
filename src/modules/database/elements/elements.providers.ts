import { DataSource } from 'typeorm';

import { DATA_SOURCE, ELEMENTS_REPOSITORY } from '../constants';
import { Elements } from './elements.entity';

export const elementsProviders = [
  {
    provide: ELEMENTS_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Elements),
    inject: [DATA_SOURCE],
  },
];
