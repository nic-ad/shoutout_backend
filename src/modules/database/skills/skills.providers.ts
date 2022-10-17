import { DataSource } from 'typeorm';

import { DATA_SOURCE, SKILLS_REPOSITORY } from '../constants';
import { Skills } from './skills.entity';

export const SkillsProvider = {
  provide: SKILLS_REPOSITORY,
  useFactory: (dataSource: DataSource) => dataSource.getRepository(Skills),
  inject: [DATA_SOURCE],
};
