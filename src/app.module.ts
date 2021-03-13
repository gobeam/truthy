import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import * as ormConfig from './config/ormconfig';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    AuthModule,
    RolesModule,
    PermissionsModule
  ]
})
export class AppModule {}
