import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleRepository } from './role.repository';
import { UniqueValidatorPipe } from '../common/pipes/unique-validator.pipe';

@Module({
  imports: [TypeOrmModule.forFeature([RoleRepository])],
  controllers: [RolesController],
  providers: [RolesService, UniqueValidatorPipe]
})
export class RolesModule {}
