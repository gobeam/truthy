import { Repository, UpdateResult } from 'typeorm';
import { Expose } from 'class-transformer';

import { BaseRepository } from 'src/common/repository/base.repository';
import { ModelSerializer } from 'src/common/serializer/model.serializer';
import { NotFoundException } from 'src/exception/not-found.exception';

class MockEntity {
  id: number;
  test: string;
  description: string;
}

class MockSerializer extends ModelSerializer {
  id: number;
  test: string;
  @Expose({
    groups: ['tester']
  })
  description: string;
}

const createQueryBuilder: any = {
  getMany: () => [],
  where: () => createQueryBuilder
};

describe('test base repository', () => {
  let baseRepository, entity: MockEntity;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    baseRepository = new BaseRepository<MockEntity, MockSerializer>();
    entity = new MockEntity();
    entity.id = 1;
    entity.test = 'testing';
    entity.description = 'description testing';
  });

  describe('test get entity by id', () => {
    it('if entity is found', async () => {
      const findOneSpy = jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValue(entity);
      const result = await baseRepository.get(1);
      expect(findOneSpy).toHaveBeenCalledTimes(1);
      expect(findOneSpy).toHaveBeenCalledWith({
        where: {
          id: 1
        },
        relations: []
      });
      expect(result).toEqual(entity);
    });

    it('if entity is not found', async () => {
      const findOneSpy = jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValue(undefined);
      await expect(baseRepository.get(1)).rejects.toThrowError(
        NotFoundException
      );
      expect(findOneSpy).toHaveBeenCalledWith({
        where: {
          id: 1
        },
        relations: []
      });
    });
  });

  describe('test get all entity', () => {
    it('get all entity', async () => {
      // const createQueryBuilderSpy = jest
      //   .spyOn(Repository.prototype, 'createQueryBuilder')
      //   .mockImplementation(() => createQueryBuilder);
      const findSpy = jest
        .spyOn(Repository.prototype, 'find')
        .mockResolvedValue([entity]);
      await baseRepository.findAll(entity, []);
      expect(findSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('test paginate method', () => {
    it('paginate', async () => {
      const findAndCountSpy = jest
        .spyOn(Repository.prototype, 'findAndCount')
        .mockResolvedValue([[], 10]);
      baseRepository.transformMany = jest.fn().mockResolvedValue([]);
      await baseRepository.paginate(entity, [], {
        page: 1,
        limit: 10
      });
      expect(findAndCountSpy).toHaveBeenCalledTimes(1);
      expect(baseRepository.transformMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('test create entity', () => {
    it('create entity', async () => {
      const createSpy = jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValue(entity);
      const findOneSpy = jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValue(entity);
      const result = await baseRepository.createEntity(entity);
      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(findOneSpy).toHaveBeenCalledTimes(1);
      expect(findOneSpy).not.toThrow();
      expect(createSpy).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });
  });

  describe('test update entity', () => {
    let updateData, updateResult: UpdateResult;
    beforeEach(() => {
      updateData = {
        test: 'changed'
      };
      updateResult = {
        generatedMaps: [],
        raw: {},
        affected: 1
      };
    });
    it('update existing entity', async () => {
      baseRepository.get = jest.fn();
      baseRepository.transform = jest.fn();
      const updateSpy = jest
        .spyOn(Repository.prototype, 'update')
        .mockResolvedValue(updateResult);
      const updateData = {
        test: 'changed'
      };
      await baseRepository.updateEntity(entity, updateData);
      expect(updateSpy).toHaveBeenCalledWith(1, updateData);
      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(baseRepository.get).toHaveBeenCalledTimes(1);
    });
    it('trying to update item that does not exists', async () => {
      baseRepository.get = jest.fn();
      baseRepository.get.mockRejectedValue(new NotFoundException());
      updateResult.affected = 0;
      const updateSpy = jest
        .spyOn(Repository.prototype, 'update')
        .mockResolvedValue(updateResult);
      await expect(
        baseRepository.updateEntity(entity, updateData)
      ).rejects.toThrowError(NotFoundException);
      expect(updateSpy).toHaveBeenCalledTimes(1);
    });
  });
});
