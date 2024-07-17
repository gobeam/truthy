import { ThrottlerModule } from '@nestjs/throttler';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import Redis from 'ioredis';

import { AppModule } from 'src/app.module';
import { AppDataSource } from 'src/config/ormconfig';
import assert from 'assert';

export class AppFactory {
  private constructor(
    private readonly appInstance: INestApplication,
    private readonly redis: Redis,
    protected readonly connection: DataSource
  ) {}

  get instance() {
    return this.appInstance;
  }

  get dbConnection() {
    return this.connection;
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
              storage: new ThrottlerStorageRedisService(redis),
              throttlers: [
                {
                  name: 'test',
                  ttl: 60,
                  limit: 60
                }
              ]
            };
          }
        })
      ]
    });

    const module = await moduleBuilder.compile();

    const app = module.createNestApplication(undefined, {
      logger: false
    });

    await app.init();
    await AppDataSource.initialize();
    return new AppFactory(app, redis, AppDataSource);
  }

  async close() {
    if (this.redis) {
      await teardown(this.redis);
    }
    if (this.appInstance) {
      await this.appInstance.close();
    }

    await this.connection.dropDatabase();
  }

  async cleanupDbTable() {
    if (this.connection.isInitialized) {
      const entities = this.connection.entityMetadatas;
      for (const entity of entities) {
        const queryRunner = this.connection.manager.getRepository(entity.name);
        await queryRunner.query(
          `TRUNCATE "${entity.tableName}" RESTART IDENTITY CASCADE;`
        );
      }
    }
    if ((await this.redis.ping()) === 'PONG') {
      await this.redis.flushall();
    }
  }
}

const teardown = async (redis) => {
  await new Promise((resolve) => {
    redis.quit(() => {
      console.log('Redis connection closed');
      resolve(true);
    });
  });
  // redis.quit() creates a thread to close the connection.
  // We wait until all threads have been run once to ensure the connection closes.
  await new Promise((resolve) => setImmediate(resolve));
};

const setupRedis = async () => {
  const redis = Redis.createClient();
  await redis.flushall();
  return redis;
};
