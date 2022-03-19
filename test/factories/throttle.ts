import { Global, Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Global()
@Module({
  providers: [
    {
      provide: ThrottlerModule,
      useValue: {
        limit: 10,
        ttl: 1000,
        storage: jest.fn()
      } // mock
    }
  ]
})
export default class Throttle {}
