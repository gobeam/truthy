import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { RefreshTokenRepository } from 'src/refresh-token/refresh-token.repository';
import { UserSerializer } from 'src/auth/serializer/user.serializer';
import { dataSourceStubs } from 'test/stub/data-source.stub';

const mockRefreshToken = {
  id: 1,
  userId: 1,
  expires: new Date(),
  isRevoked: false,
  save: jest.fn()
};

describe('Refresh token repository', () => {
  let repository, user, dataSource;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RefreshTokenRepository,
        {
          provide: DataSource,
          useValue: dataSourceStubs
        }
      ]
    }).compile();
    repository = module.get<RefreshTokenRepository>(RefreshTokenRepository);
    dataSource = module.get<DataSource>(DataSource);
    user = new UserSerializer();
    user.id = 1;
    user.email = 'test@mail.com';
  });

  it('create new refresh token', async () => {
    jest.spyOn(dataSource, 'getRepository').mockReturnValue({
      save: jest.fn().mockReturnValue(mockRefreshToken)
    });
    await repository.createRefreshToken(user, 60 * 60);
    expect(dataSource.getRepository).toHaveBeenCalledTimes(1);
    expect(dataSource.getRepository().save).toHaveBeenCalledTimes(1);
  });

  it('findTokenById', async () => {
    jest.spyOn(repository, 'findOne').mockReturnValue(mockRefreshToken);
    await repository.findTokenById(1);
    expect(repository.findOne).toHaveBeenCalledTimes(1);
  });
});
