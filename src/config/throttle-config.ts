import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { ThrottlerModuleOptions } from '@nestjs/throttler';
import config from 'config';

const throttleConfigVariables = config.get('throttle.global');
const redisConfig = config.get('queue');
export const throttleConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      ttl: process.env.THROTTLE_TTL || throttleConfigVariables.get('ttl'),
      limit: process.env.THROTTLE_LIMIT || throttleConfigVariables.get('limit'),
      name: 'auth'
    }
  ],
  storage: new ThrottlerStorageRedisService({
    host: process.env.REDIS_HOST || redisConfig.host,
    port: process.env.REDIS_PORT || redisConfig.port,
    password: process.env.REDIS_PASSWORD || redisConfig.password
  })
};
