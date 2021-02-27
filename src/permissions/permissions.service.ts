import { HttpCode, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionRepository } from './permission.repository';
import { PermissionEntity } from './entities/permission.entity';
import { PermissionFilterDto } from './dto/permission-filter.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionRepository)
    private repository: PermissionRepository
  ) {}

  create(createPermissionDto: CreatePermissionDto): Promise<PermissionEntity> {
    return this.repository.store(createPermissionDto);
  }

  findAll(
    permissionFilterDto: PermissionFilterDto
  ): Promise<PermissionEntity[]> {
    return this.repository.findAll(permissionFilterDto);
  }

  async findOne(id: number): Promise<PermissionEntity> {
    const permission = await this.repository.findOne({
      where: { id }
    });
    if (!permission) {
      throw new NotFoundException();
    }
    return permission;
  }

  update(
    id: number,
    updatePermissionDto: UpdatePermissionDto
  ): Promise<PermissionEntity> {
    return this.repository.updateItem(id, updatePermissionDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(id: number): Promise<void> {
    const permission = await this.findOne(id);
    await permission.remove();
  }
}
