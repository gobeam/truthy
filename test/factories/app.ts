import { ThrottlerModule } from '@nestjs/throttler';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnectionManager } from 'typeorm';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { useContainer as classValidatorUseContainer } from 'class-validator';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import * as Redis from 'ioredis';
import * as config from 'config';

import { AppModule } from 'src/app.module';

const dbConfig = config.get('db');

export class AppFactory {
  private constructor(
    private readonly appInstance: INestApplication,
    private readonly redis: Redis.Redis
  ) {}

  get instance() {
    return this.appInstance;
  }

  static async new() {
    const redis = await setupRedis();
    const module = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          ...dbConfiguration
        }),
        ThrottlerModule.forRootAsync({
          useFactory: () => {
            return {
              ttl: 60,
              limit: 60,
              storage: new ThrottlerStorageRedisService(redis)
            };
          }
        })
      ]
    })
      .overrideProvider('LOGIN_THROTTLE')
      .useFactory({
        factory: () => {
          return new RateLimiterRedis({
            storeClient: redis,
            keyPrefix: 'login',
            points: 5,
            duration: 60 * 60 * 24 * 30, // Store number for 30 days since first fail
            blockDuration: 3000
          });
        }
      })
      .compile();

    const app = module.createNestApplication();

    classValidatorUseContainer(app.select(AppModule), {
      fallbackOnErrors: true
    });

    await app.init();

    return new AppFactory(app, redis);
  }

  async refreshDatabase() {
    const connection = getConnectionManager().get();
    if (connection.isConnected) {
      const tables = connection.entityMetadatas
        .map((entity) => `"${entity.tableName}"`)
        .join(', ');

      await connection.query(
        `TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`
      );
    }
  }

  async teardown(redis: Redis.Redis) {
    return new Promise<void>((resolve) => {
      redis.quit();
      redis.on('end', () => {
        resolve();
      });
    });
  }

  async close() {
    await this.appInstance.close();
    if (this.redis) await this.teardown(this.redis);
    const connection = getConnectionManager().get();

    if (connection.isConnected) {
      connection
        .close()
        .then(() => {
          console.log('DB connection closed');
        })
        .catch((err: any) => {
          console.error('Error clossing connection to DB, ', err);
        });
    } else {
      console.log('DB connection already closed.');
    }
  }
}

const setupRedis = async () => {
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379
  });
  await redis.flushall();
  return redis;
};

const dbConfiguration = {
  type: dbConfig.type || 'postgres',
  host: process.env.DB_HOST || dbConfig.host,
  port: parseInt(process.env.DB_PORT) || dbConfig.port,
  database: process.env.DB_DATABASE_NAME || dbConfig.database,
  username: process.env.DB_USERNAME || dbConfig.username,
  password: process.env.DB_PASSWORD || dbConfig.password,
  logging: false,
  keepConnectionAlive: true,
  synchronize: process.env.NODE_ENV === 'test',
  dropSchema: process.env.NODE_ENV === 'test',
  entities: [__dirname + '/../../src/**/*.entity{.ts,.js}']
} as TypeOrmModuleOptions;
