import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleRepository } from './role.repository';
import { UniqueValidatorPipe } from '../common/pipes/unique-validator.pipe';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([RoleRepository]), AuthModule],
  controllers: [RolesController],
  providers: [RolesService, UniqueValidatorPipe]
})
export class RolesModule {}
