import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

import { Channel } from './channel/channel.entity';
import { DATA_SOURCE } from './constants';
import { Elements } from './elements/elements.entity';
import { Message } from './message/message.entity';
import { Person } from './person/person.entity';
const result = dotenv.config({ path: '.env' });
if (result.error) {
  //TODO: Handle error
}

const SYNC = process.env.SYNCHRONIZE === 'true';

const sharedConfig = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  entities: [Person, Channel, Elements, Message],
  migrationsTableName: 'migrations_table',
  migrations: ['dist/modules/database/migrations/**/*{.js}'],
  synchronize: SYNC,
} as DataSourceOptions;

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: async () => getInitializedDataSource(),
  },
];

export const getInitializedDataSource = (database?: string, port?: string) => {
  const dataSource = new DataSource({
    ...sharedConfig,
    database: database || process.env.POSTGRES_DB,
    port: parseInt(port || process.env.POSTGRES_PORT),
  } as DataSourceOptions);

  return dataSource.initialize();
};

export const dataSourceInstance = new DataSource({
  ...sharedConfig,
  migrations: ['src/modules/database/migrations/**/*{.ts,.js}'],
});
