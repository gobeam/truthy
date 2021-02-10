import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';

const dbConfig = config.get('db');
export const TypeOrmConfig: TypeOrmModuleOptions = {
  type: process.env.DB_TYPE || dbConfig.type,
  host: process.env.DB_HOST || dbConfig.host,
  port: process.env.DB_PORT || dbConfig.port,
  username: process.env.DB_USERNAME || dbConfig.username,
  password: process.env.DB_PASSWORD || dbConfig.password,
  database: process.env.DB_DATABASE_NAME || dbConfig.database,
  entities: [__dirname + '/../**/*.entity.js'],
  synchronize: process.env.TYPE_ORM_SYNC || dbConfig.synchronize,
  migrationsTableName: 'migrations',
  migrations: ['./migration/*.js', 'migration/*.ts'],
  cli: {
    migrationsDir: './migration',
  },
};
