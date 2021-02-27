import { Test, TestingModule } from '@nestjs/testing';
import { MethodList } from '../config/permission-config';
import { PermissionRepository } from './permission.repository';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { NotFoundException } from '@nestjs/common';

const mockPermission = {
  description: 'example test description',
  path: '/tests',
  method: MethodList.POST,
  resource: 'test',
  save: jest.fn(),
  remove: jest.fn()
};

describe('PermissionRepository', () => {
  let repository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionRepository]
    }).compile();
    repository = module.get<PermissionRepository>(PermissionRepository);
  });

  describe('update', () => {
    it('update item that exists in database', async () => {
      repository.createQueryBuilder = jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute: jest
          .fn()
          .mockReturnValue({ affected: 1, raw: [mockPermission] })
      }));
      const updatePermissionDto: UpdatePermissionDto = mockPermission;
      const result = await repository.updateItem(1, updatePermissionDto);
      expect(result).toEqual(mockPermission);
    });

    it('trying to update item that does not exists in database', async () => {
      repository.createQueryBuilder = jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute: jest.fn().mockReturnValue({ affected: 0 })
      }));
      const updatePermissionDto: UpdatePermissionDto = mockPermission;
      await expect(
        repository.updateItem(1, updatePermissionDto)
      ).rejects.toThrowError(NotFoundException);
    });
  });
});
