import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import * as ormConfig from './config/ormconfig';

@Module({
  imports: [TypeOrmModule.forRoot(ormConfig), AuthModule]
})
export class AppModule {}
