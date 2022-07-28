import { DataSource } from 'typeorm';
import { DATA_SOURCE } from './constants';
import { Person } from './person/person.entity';
import { Channel } from './channel/channel.entity';
import { Elements } from './elements/elements.entity';
import { Message } from './message/message.entity';
import * as dotenv from 'dotenv';
const result = dotenv.config({ path: '.env' });
if (result.error) {
  //TODO: Handle error
}

const SYNC = process.env.SYNCHRONIZE === 'true';

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: async () => {
      const dataSource = dataSourceInstance;
      return dataSource.initialize();
    },
  },
];

export const dataSourceInstance = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [Person, Channel, Elements, Message],
  migrations: ['src/modules/database/migrations/**/*{.ts,.js}'],
  migrationsTableName: 'migrations_table',
  synchronize: SYNC,
});
