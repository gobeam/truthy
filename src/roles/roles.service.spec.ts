import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { RoleRepository } from './role.repository';
import { RoleFilterDto } from './dto/role-filter.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateRoleDto } from './dto/update-role.dto';

const roleRepositoryMock = () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  store: jest.fn()
});
const mockRole = {
  id: 1,
  description: 'test description',
  name: 'test',
  save: jest.fn(),
  remove: jest.fn()
};

describe('RolesService', () => {
  let service: RolesService, roleRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: RoleRepository, useFactory: roleRepositoryMock }
      ]
    }).compile();

    service = module.get<RolesService>(RolesService);
    roleRepository = module.get<RoleRepository>(RoleRepository);
  });

  it('findAll', async () => {
    const roleFilterDto: RoleFilterDto = {
      name: 'example'
    };
    roleRepository.findAll.mockResolvedValue('result');
    const result = await service.findAll(roleFilterDto);
    expect(roleRepository.findAll).toHaveBeenCalledWith(roleFilterDto);
    expect(result).toEqual('result');
  });

  it('create', async () => {
    const createRoleDto: CreateRoleDto = mockRole;
    const result = await service.create(createRoleDto);
    expect(roleRepository.store).toHaveBeenCalledWith(createRoleDto);
    expect(roleRepository.store).not.toThrow();
    expect(result).toBe(undefined);
  });

  describe('findOne', () => {
    it('find success', async () => {
      roleRepository.findOne.mockResolvedValue(mockRole);
      const result = await service.findOne(1);
      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(roleRepository.findOne).not.toThrow();
      expect(result).toBe(mockRole);
    });
    it('find fail', async () => {
      roleRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('update', () => {
    it('update item that exists in database', async () => {
      const updateRoleDto: UpdateRoleDto = mockRole;
      service.findOne = jest.fn().mockResolvedValue(mockRole);
      await service.update(1, updateRoleDto);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(mockRole.save).toHaveBeenCalledTimes(1);
    });

    it('trying to update item that does not exists in database', async () => {
      const updateRoleDto: UpdateRoleDto = mockRole;
      service.findOne = jest.fn().mockImplementation(() => {
        throw NotFoundException;
      });
      await expect(service.update(1, updateRoleDto)).rejects.toThrow();
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('trying to delete existing item', async () => {
      service.findOne = jest.fn().mockResolvedValue(mockRole);
      const result = await service.remove(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).not.toThrow();
      expect(mockRole.remove).toHaveBeenCalledTimes(1);
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
