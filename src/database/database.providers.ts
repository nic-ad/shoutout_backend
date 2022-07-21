import { DataSource } from 'typeorm';
import { DATA_SOURCE } from './constants';
import { Person } from './modules/person/person.entity';
import { Channel } from './modules/channel/channel.entity';
import { Elements } from './modules/elements/elements.entity';
import { Message } from './modules/message/message.entity';
import * as dotenv from 'dotenv';
const result = dotenv.config({ path: '.env' });
if (result.error) {
}
export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT) || 5432,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        entities: [Person, Channel, Elements, Message],
        migrations: ['./src/database/migrations/**/*{.ts,.js}'],
        migrationsTableName: 'migrations_table',
        synchronize: false,
      });

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
  migrations: ['src/database/migration/**/*{.ts,.js}'],
  migrationsTableName: 'migrations_table',
  synchronize: false,
});
