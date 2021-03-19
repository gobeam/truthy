import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionRepository } from './permission.repository';
import { UniqueValidatorPipe } from '../common/pipes/unique-validator.pipe';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionRepository]), AuthModule],
  controllers: [PermissionsController],
  providers: [PermissionsService, UniqueValidatorPipe]
})
export class PermissionsModule {}
