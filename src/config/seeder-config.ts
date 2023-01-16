import { DataSource } from 'typeorm';
import { dataSourceOptions } from './ormconfig';

export const SeederDataSource = new DataSource({
  ...dataSourceOptions,
  migrationsTableName: 'seeders',
  migrations: [__dirname + '/../database/seeds/**/*{.ts,.js}']
});
