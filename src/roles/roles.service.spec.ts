import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { RoleRepository } from './role.repository';
import { RoleFilterDto } from './dto/role-filter.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import {
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionsService } from '../permissions/permissions.service';
import { MethodList } from '../config/permission-config';

const roleRepositoryMock = () => ({
  findAll: jest.fn(),
  get: jest.fn(),
  createEntity: jest.fn(),
  countEntityByCondition: jest.fn(),
  getAll: jest.fn(),
  findOne: jest.fn(),
  store: jest.fn(),
  updateItem: jest.fn(),
  updateEntity: jest.fn()
});

const permissionServiceMock = () => ({
  findAll: jest.fn(),
  whereInIds: jest.fn()
});

const mockPermission = {
  description: 'example test description',
  path: '/tests',
  method: MethodList.POST,
  resource: 'test'
};

const mockRole = {
  id: 1,
  description: 'test description',
  permissions: [1],
  name: 'test',
  save: jest.fn(),
  remove: jest.fn()
};

describe('RolesService', () => {
  let service: RolesService, roleRepository, permissionService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: RoleRepository, useFactory: roleRepositoryMock },
        { provide: PermissionsService, useFactory: permissionServiceMock }
      ]
    }).compile();

    service = module.get<RolesService>(RolesService);
    permissionService = module.get<PermissionsService>(PermissionsService);
    roleRepository = module.get<RoleRepository>(RoleRepository);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('findAll', async () => {
    const roleFilterDto: RoleFilterDto = {
      name: 'example'
    };
    roleRepository.getAll.mockResolvedValue('result');
    const result = await service.findAll(roleFilterDto);
    expect(roleRepository.getAll).toHaveBeenCalledWith(roleFilterDto);
    expect(result).toEqual('result');
  });

  it('create', async () => {
    const createRoleDto: CreateRoleDto = mockRole;
    permissionService.whereInIds.mockResolvedValue([mockPermission]);
    service.getPermissionByIds = jest.fn().mockResolvedValue([mockPermission]);
    const result = await service.store(createRoleDto);
    expect(service.getPermissionByIds).toHaveBeenCalledWith([1]);
    expect(roleRepository.store).toHaveBeenCalledWith(createRoleDto, [
      mockPermission
    ]);
    expect(roleRepository.createEntity).not.toThrow();
    expect(result).toBe(undefined);
  });

  describe('findOne', () => {
    it('role find success', async () => {
      roleRepository.get.mockResolvedValue(mockRole);
      const result = await service.findOne(1);
      expect(roleRepository.get).toHaveBeenCalledWith(1);
      expect(roleRepository.get).not.toThrow();
      expect(result).toBe(mockRole);
    });
    it('find fail', async () => {
      roleRepository.get.mockImplementation(() => {
        throw new NotFoundException();
      });
      await expect(service.findOne(1)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('update', () => {
    it('try to update using duplicate role name', async () => {
      roleRepository.findOne.mockResolvedValue(mockRole);
      roleRepository.countEntityByCondition.mockResolvedValue(1);
      const updateRoleDto: UpdateRoleDto = mockRole;
      await expect(service.update(1, updateRoleDto)).rejects.toThrowError(
        UnprocessableEntityException
      );
      expect(roleRepository.countEntityByCondition).toHaveBeenCalledTimes(1);
    });
    it('update item that exists in database', async () => {
      roleRepository.updateEntity.mockResolvedValue(mockRole);
      roleRepository.findOne.mockResolvedValue(mockRole);
      roleRepository.countEntityByCondition.mockResolvedValue(0);
      roleRepository.get.mockResolvedValue(mockRole);
      service.getPermissionByIds = jest
        .fn()
        .mockResolvedValue([mockPermission]);
      const updateRoleDto: UpdateRoleDto = mockRole;
      await service.update(1, updateRoleDto);
      expect(roleRepository.countEntityByCondition).toHaveBeenCalled();
      expect(service.getPermissionByIds).toHaveBeenCalledWith([1]);
      expect(roleRepository.updateItem).toHaveBeenCalledWith(
        mockRole,
        updateRoleDto,
        [mockPermission]
      );
    });

    it('trying to update item that does not exists in database', async () => {
      service.getPermissionByIds = jest
        .fn()
        .mockResolvedValue([mockPermission]);
      roleRepository.countEntityByCondition.mockResolvedValue(0);
      roleRepository.findOne.mockResolvedValue(null);
      const updateRoleDto: UpdateRoleDto = mockRole;
      await expect(service.update(1, updateRoleDto)).rejects.toThrowError(
        NotFoundException
      );
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      roleRepository.get.mockResolvedValue(mockRole);
    });
    it('trying to delete existing role', async () => {
      const result = await service.remove(2);
      expect(roleRepository.get).toHaveBeenCalledTimes(1);
      expect(roleRepository.get).toHaveBeenCalledWith(2);
      expect(roleRepository.get).not.toThrow();
      expect(mockRole.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual(undefined);
    });

    it('trying to delete no existing role', async () => {
      roleRepository.get = jest.fn().mockImplementation(() => {
        throw NotFoundException;
      });
      await expect(service.remove(1)).rejects.toThrow();
      expect(roleRepository.get).toHaveBeenCalledTimes(1);
    });
  });
});
