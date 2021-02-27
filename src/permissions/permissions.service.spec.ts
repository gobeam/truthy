import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { MethodList } from '../config/permission-config';
import { PermissionRepository } from './permission.repository';
import { NotFoundException } from '@nestjs/common';
import { PermissionFilterDto } from './dto/permission-filter.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

const permissionRepositoryMock = () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  store: jest.fn(),
  updateItem: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    execute: jest.fn().mockReturnThis()
  }))
});

const mockPermission = {
  description: 'example test description',
  path: '/tests',
  method: MethodList.POST,
  resource: 'test',
  save: jest.fn(),
  remove: jest.fn()
};

describe('PermissionsService', () => {
  let service: PermissionsService, repository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: PermissionRepository, useFactory: permissionRepositoryMock }
      ]
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
    repository = module.get<PermissionRepository>(PermissionRepository);
  });

  it('findAll', async () => {
    const permissionFilterDto: PermissionFilterDto = {
      description: 'test description'
    };
    repository.findAll.mockResolvedValue('result');
    const result = await service.findAll(permissionFilterDto);
    expect(repository.findAll).toHaveBeenCalledWith(permissionFilterDto);
    expect(result).toEqual('result');
  });

  it('create', async () => {
    const createPermissionDto: CreatePermissionDto = mockPermission;
    const result = await service.create(createPermissionDto);
    expect(repository.store).toHaveBeenCalledWith(createPermissionDto);
    expect(repository.store).not.toThrow();
    expect(result).toBe(undefined);
  });

  describe('findOne', () => {
    it('find success', async () => {
      repository.findOne.mockResolvedValue(mockPermission);
      const result = await service.findOne(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(repository.findOne).not.toThrow();
      expect(result).toBe(mockPermission);
    });
    it('find fail', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('update', () => {
    it('update item that exists in database', async () => {
      repository.updateItem.mockResolvedValue(mockPermission);
      const updatePermissionDto: UpdatePermissionDto = mockPermission;
      const result = await service.update(1, updatePermissionDto);
      expect(repository.updateItem).toHaveBeenCalledWith(
        1,
        updatePermissionDto
      );
      expect(result).toEqual(mockPermission);
    });

    it('trying to update item that does not exists in database', async () => {
      repository.updateItem.mockRejectedValue(new NotFoundException());
      const updatePermissionDto: UpdatePermissionDto = mockPermission;
      await expect(service.update(1, updatePermissionDto)).rejects.toThrowError(
        NotFoundException
      );
    });
  });

  describe('remove', () => {
    it('trying to delete existing item', async () => {
      service.findOne = jest.fn().mockResolvedValue(mockPermission);
      const result = await service.remove(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).not.toThrow();
      expect(mockPermission.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual(undefined);
    });

    it('trying to delete no existing item', async () => {
      service.findOne = jest.fn().mockImplementation(() => {
        throw NotFoundException;
      });
      await expect(service.remove(1)).rejects.toThrow();
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });
  });
});
