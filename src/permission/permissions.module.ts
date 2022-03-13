import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PermissionsService } from 'src/permission/permissions.service';
import { PermissionsController } from 'src/permission/permissions.controller';
import { PermissionRepository } from 'src/permission/permission.repository';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionRepository]), AuthModule],
  exports: [PermissionsService],
  controllers: [PermissionsController],
  providers: [PermissionsService, UniqueValidatorPipe]
})
export class PermissionsModule {}
