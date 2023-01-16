export const dataSourceStubs = {
  createEntityManager: jest.fn().mockReturnValue({
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      getMany: jest.fn().mockResolvedValue([]),
      getOne: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhereInIds: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
      getRawOne: jest.fn().mockResolvedValue(undefined),
      getCount: jest.fn().mockResolvedValue(0),
      leftJoin: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoinAndMapMany: jest.fn().mockReturnThis(),
      leftJoinAndMapOne: jest.fn().mockReturnThis(),
      innerJoinAndMapMany: jest.fn().mockReturnThis(),
      innerJoinAndMapOne: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis()
    })
  }),
  getRepository: jest.fn().mockReturnValue({
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(undefined),
    save: jest.fn().mockResolvedValue(undefined),
    create: jest.fn().mockReturnValue({}),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined)
  })
};
