import { ThrottlerModule } from '@nestjs/throttler';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Connection, ConnectionManager, QueryRunner } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { useContainer as classValidatorUseContainer } from 'class-validator';
import { v4 as uuid4 } from 'uuid';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import * as Redis from 'ioredis';
import * as config from 'config';

import { AppModule } from 'src/app.module';
import { RateLimiterRedis } from 'rate-limiter-flexible';

const dbConfig = config.get('db');

export class AppFactory {
  private constructor(
    private readonly appInstance: INestApplication,
    private readonly database: string,
    private readonly connection: Connection,
    private readonly queryRunner: QueryRunner,
    private readonly redis: Redis.Redis
  ) {}

  get instance() {
    return this.appInstance;
  }

  static async new() {
    const { database, connection, queryRunner } = await setupTestDatabase();
    const redis = await setupRedis();
    const module = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          ...connection.options,
          type: dbConfig.type,
          database
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
        // createMockModule([
        //   {
        //     provide: ThrottlerModule,
        //     useFactory: () => {
        //       return {
        //         ttl: jest.fn(),
        //         limit: jest.fn(),
        //         storage: jest.fn()
        //       };
        //     }
        //   }
        // ])
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

    return new AppFactory(app, database, connection, queryRunner, redis);
  }

  async refreshDatabase() {
    await Promise.all(
      this.connection.entityMetadatas.map((entity) => {
        return this.connection
          .getRepository(entity.name)
          .query(`TRUNCATE TABLE "${entity.tableName}" CASCADE`);
      })
    );
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
    await this.queryRunner.query(`DROP DATABASE "${this.database}"`);
    await this.teardown(this.redis);
    await this.connection.close();
  }
}

const setupRedis = async () => {
  const redis = new Redis({});
  await redis.flushall();
  return redis;
};

const setupTestDatabase = async () => {
  const database = `test_${uuid4()}`;
  const manager = new ConnectionManager().create({
    type: dbConfig.type,
    host: process.env.DB_HOST || dbConfig.host,
    port: parseInt(process.env.DB_PORT) || dbConfig.port,
    database: process.env.DB_DATABASE_NAME || dbConfig.database,
    username: process.env.DB_USERNAME || dbConfig.username,
    password: process.env.DB_PASSWORD || dbConfig.password,
    logging: false,
    synchronize: false,
    migrationsRun: true,
    migrationsTableName: 'migrations',
    migrations: [__dirname + '/../../src/database/migrations/**/*{.ts,.js}'],
    entities: [__dirname + '/../../src/**/*.entity{.ts,.js}']
  });

  const queryRunner = manager.createQueryRunner();
  const connection = await manager.connect();

  await queryRunner.createDatabase(database, true);

  return { database, connection, queryRunner };
};
