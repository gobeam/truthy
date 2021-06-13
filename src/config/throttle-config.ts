import * as config from 'config';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { ThrottlerModuleOptions } from '@nestjs/throttler';

const throttleConfigVariables = config.get('throttle.global');
const redisConfig = config.get('queue');
const throttleConfig: ThrottlerModuleOptions = {
  ttl: process.env.THROTTLE_TTL || throttleConfigVariables.get('ttl'),
  limit: process.env.THROTTLE_LIMIT || throttleConfigVariables.get('limit'),
  storage: new ThrottlerStorageRedisService({
    host: redisConfig.host,
    port: redisConfig.port
  })
};

export = throttleConfig;
