import { Test, TestingModule } from '@nestjs/testing';
import { UnprocessableEntityException } from '@nestjs/common';

import { PermissionsService } from 'src/permission/permissions.service';
import { MethodList } from 'src/config/permission-config';
import { PermissionRepository } from 'src/permission/permission.repository';
import { PermissionFilterDto } from 'src/permission/dto/permission-filter.dto';
import { CreatePermissionDto } from 'src/permission/dto/create-permission.dto';
import { UpdatePermissionDto } from 'src/permission/dto/update-permission.dto';
import { NotFoundException } from 'src/exception/not-found.exception';

const permissionRepositoryMock = () => ({
  getAll: jest.fn(),
  syncPermission: jest.fn(),
  paginate: jest.fn(),
  findOne: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
  createEntity: jest.fn(),
  countEntityByCondition: jest.fn(),
  updateEntity: jest.fn()
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
        {
          provide: PermissionRepository,
          useFactory: permissionRepositoryMock
        }
      ]
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
    repository = module.get<PermissionRepository>(PermissionRepository);
  });

  it('findAll', async () => {
    const permissionFilterDto: PermissionFilterDto = {
      keywords: 'test description',
      limit: 10,
      page: 1
    };
    repository.paginate.mockResolvedValue('result');
    const result = await service.findAll(permissionFilterDto);
    expect(repository.paginate).toHaveBeenCalledTimes(1);
    expect(result).toEqual('result');
  });

  it('create', async () => {
    const createPermissionDto: CreatePermissionDto = mockPermission;
    const result = await service.create(createPermissionDto);
    expect(repository.createEntity).toHaveBeenCalledWith(createPermissionDto);
    expect(repository.createEntity).not.toThrow();
    expect(result).toBe(undefined);
  });

  it('sync permission', async () => {
    repository.syncPermission.mockResolvedValue(null);
    await service.syncPermission();
    expect(repository.syncPermission).toHaveBeenCalledTimes(1);
  });

  describe('findOne', () => {
    it('find success', async () => {
      repository.get.mockResolvedValue(mockPermission);
      const result = await service.findOne(1);
      expect(repository.get).toHaveBeenCalledTimes(1);
      expect(repository.get).not.toThrow();
      expect(result).toBe(mockPermission);
    });
    it('find fail', async () => {
      repository.get.mockImplementation(() => {
        throw new NotFoundException();
      });
      await expect(service.findOne(1)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('update', () => {
    let updatePermissionDto: UpdatePermissionDto;
    beforeEach(() => {
      updatePermissionDto = mockPermission;
    });
    it('try to update using duplicate description', async () => {
      repository.findOne.mockResolvedValue(mockPermission);
      repository.countEntityByCondition.mockResolvedValue(1);
      await expect(service.update(1, updatePermissionDto)).rejects.toThrowError(
        UnprocessableEntityException
      );
      expect(repository.countEntityByCondition).toHaveBeenCalledTimes(1);
    });

    it('update item that exists in database', async () => {
      repository.countEntityByCondition.mockResolvedValue(0);
      repository.updateEntity.mockResolvedValue(mockPermission);
      repository.get.mockResolvedValue(mockPermission);
      const role = await service.update(1, updatePermissionDto);
      expect(repository.get).toHaveBeenCalledWith(1);
      expect(repository.updateEntity).toHaveBeenCalledWith(
        mockPermission,
        updatePermissionDto
      );
      expect(role).toEqual(mockPermission);
    });

    it('trying to update item that does not exists in database', async () => {
      repository.updateEntity.mockRejectedValue(new NotFoundException());
      const updatePermissionDto: UpdatePermissionDto = mockPermission;
      repository.get.mockResolvedValue(null);
      await expect(service.update(1, updatePermissionDto)).rejects.toThrowError(
        NotFoundException
      );
    });
  });

  describe('remove', () => {
    it('trying to delete existing item', async () => {
      service.findOne = jest.fn().mockResolvedValue(mockPermission);
      repository.delete = jest.fn().mockResolvedValue('');
      const result = await service.remove(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).not.toThrow();
      expect(repository.delete).toHaveBeenCalledTimes(1);
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
