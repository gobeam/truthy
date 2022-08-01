import { ThrottlerModule } from '@nestjs/throttler';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createConnection, getConnection } from 'typeorm';
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
    const moduleBuilder = Test.createTestingModule({
      imports: [
        AppModule,
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
      });

    const module = await moduleBuilder.compile();

    const app = module.createNestApplication(undefined, {
      logger: false
    });

    await app.init();

    return new AppFactory(app, redis);
  }

  async close() {
    await getConnection().dropDatabase();
    if (this.redis) await this.teardown(this.redis);
    if (this.appInstance) await this.appInstance.close();
  }

  static async cleanupDB() {
    const connection = getConnection();
    const tables = connection.entityMetadatas.map(
      (entity) => `"${entity.tableName}"`
    );

    for (const table of tables) {
      await connection.query(`DELETE FROM ${table};`);
    }
  }

  static async dropTables() {
    const connection = await createConnection({
      type: dbConfig.type || 'postgres',
      host: process.env.DB_HOST || dbConfig.host,
      port: parseInt(process.env.DB_PORT) || dbConfig.port,
      database: process.env.DB_DATABASE_NAME || dbConfig.database,
      username: process.env.DB_USERNAME || dbConfig.username,
      password: process.env.DB_PASSWORD || dbConfig.password
    });

    await connection.query(`SET session_replication_role = 'replica';`);
    const tables = connection.entityMetadatas.map(
      (entity) => `"${entity.tableName}"`
    );
    for (const tableName of tables) {
      await connection.query(`DROP TABLE IF EXISTS ${tableName};`);
    }

    await connection.close();
  }

  async teardown(redis: Redis.Redis) {
    return new Promise<void>((resolve) => {
      redis.quit();
      redis.on('end', () => {
        resolve();
      });
    });
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
