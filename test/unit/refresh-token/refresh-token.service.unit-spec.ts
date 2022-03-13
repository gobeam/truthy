import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';

import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';
import { AuthService } from 'src/auth/auth.service';
import { RefreshTokenRepository } from 'src/refresh-token/refresh-token.repository';
import { UserSerializer } from 'src/auth/serializer/user.serializer';
import { RefreshToken } from 'src/refresh-token/entities/refresh-token.entity';
import { CustomHttpException } from 'src/exception/custom-http.exception';
import { NotFoundException } from 'src/exception/not-found.exception';
import { ForbiddenException } from 'src/exception/forbidden.exception';
import { RefreshPaginateFilterDto } from 'src/refresh-token/dto/refresh-paginate-filter.dto';

const jwtServiceMock = () => ({
  signAsync: jest.fn(),
  verifyAsync: jest.fn()
});

const authServiceMock = () => ({
  findById: jest.fn(),
  generateAccessToken: jest.fn()
});

const repositoryMock = () => ({
  createRefreshToken: jest.fn(),
  findTokenById: jest.fn(),
  getPaginationInfo: jest.fn(),
  findAndCount: jest.fn(),
  transformMany: jest.fn(),
  find: jest.fn()
});

describe('RefreshTokenService', () => {
  let service: RefreshTokenService,
    jwtService,
    authService,
    repository,
    user: UserSerializer,
    refreshToken: RefreshToken;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: JwtService,
          useFactory: jwtServiceMock
        },
        {
          provide: AuthService,
          useFactory: authServiceMock
        },
        {
          provide: RefreshTokenRepository,
          useFactory: repositoryMock
        }
      ]
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
    jwtService = await module.get<JwtService>(JwtService);
    authService = await module.get<AuthService>(AuthService);
    repository = await module.get<RefreshTokenRepository>(
      RefreshTokenRepository
    );
    user = new UserSerializer();
    user.id = 1;
    user.email = 'test@mail.com';
    refreshToken = new RefreshToken();
    refreshToken.id = 1;
    refreshToken.userId = 1;
    refreshToken.isRevoked = false;
    refreshToken.save = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('generate refresh token', async () => {
    repository.createRefreshToken.mockResolvedValue(refreshToken);
    const tokenPayload = {
      ip: '::1',
      userAgent: 'mozilla'
    };
    await service.generateRefreshToken(user, tokenPayload);
    expect(repository.createRefreshToken).toHaveBeenCalledTimes(1);
    expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
  });

  describe('resolveRefreshToken', () => {
    it('test for malformed token', async () => {
      const testToken = 'test_token_hash';
      jest.spyOn(service, 'decodeRefreshToken').mockResolvedValue({
        jwtid: 1,
        subject: 1
      });
      jest
        .spyOn(service, 'getStoredTokenFromRefreshTokenPayload')
        .mockResolvedValue(refreshToken);
      jest
        .spyOn(service, 'getUserFromRefreshTokenPayload')
        .mockResolvedValue(null);
      await expect(service.resolveRefreshToken(testToken)).rejects.toThrowError(
        CustomHttpException
      );
      expect(service.decodeRefreshToken).toHaveBeenCalledTimes(1);
      expect(
        service.getStoredTokenFromRefreshTokenPayload
      ).toHaveBeenCalledTimes(1);
      expect(
        service.getStoredTokenFromRefreshTokenPayload
      ).toHaveBeenCalledTimes(1);
    });

    it('resolve refresh token for valid refresh token', async () => {
      const testToken = 'test_token_hash';
      jest.spyOn(service, 'decodeRefreshToken').mockResolvedValue({
        jwtid: 1,
        subject: 1
      });
      jest
        .spyOn(service, 'getStoredTokenFromRefreshTokenPayload')
        .mockResolvedValue(refreshToken);
      jest
        .spyOn(service, 'getUserFromRefreshTokenPayload')
        .mockResolvedValue(user);
      await service.resolveRefreshToken(testToken);
      expect(service.decodeRefreshToken).toHaveBeenCalledTimes(1);
      expect(service.decodeRefreshToken).toHaveBeenCalledWith(testToken);
      expect(
        service.getStoredTokenFromRefreshTokenPayload
      ).toHaveBeenCalledTimes(1);
      expect(
        service.getStoredTokenFromRefreshTokenPayload
      ).toHaveBeenCalledWith({
        jwtid: 1,
        subject: 1
      });
    });
  });

  it('createAccessTokenFromRefreshToken', async () => {
    jest.spyOn(service, 'resolveRefreshToken').mockResolvedValue({
      user,
      token: refreshToken
    });
    // jest
    //   .spyOn(service, 'generateAccessToken')
    //   .mockResolvedValue('refresh_token_hash');
    await service.createAccessTokenFromRefreshToken('old_token_hash');
    expect(service.resolveRefreshToken).toHaveBeenCalledWith('old_token_hash');
    expect(service.resolveRefreshToken).toHaveBeenCalledTimes(1);
    expect(authService.generateAccessToken).toHaveBeenCalledTimes(1);
    expect(authService.generateAccessToken).toHaveBeenCalledWith(user);
  });

  describe('decodeRefreshToken', () => {
    it('check token expired error', async () => {
      jwtService.verifyAsync.mockImplementation(() => {
        throw new TokenExpiredError('tokenExpired', new Date());
      });

      await expect(
        service.decodeRefreshToken('refresh_token_hash')
      ).rejects.toThrowError(CustomHttpException);
    });

    it('decode valid refresh token', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        jwtid: 1,
        subject: 1
      });
      await service.decodeRefreshToken('refresh_token_hash');
      expect(jwtService.verifyAsync).toHaveBeenCalledTimes(1);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('refresh_token_hash');
    });
  });

  describe('getUserFromRefreshTokenPayload', () => {
    it('check get user from refresh token with malformed token', async () => {
      await expect(
        service.getUserFromRefreshTokenPayload({
          jwtid: null,
          subject: null
        })
      ).rejects.toThrowError(CustomHttpException);
      expect(authService.findById).toHaveBeenCalledTimes(0);
    });

    it('get user from valid refresh token', async () => {
      authService.findById.mockResolvedValue(user);
      await expect(
        service.getUserFromRefreshTokenPayload({
          jwtid: 1,
          subject: 1
        })
      ).resolves.not.toThrow();
      expect(authService.findById).toHaveBeenCalledTimes(1);
      expect(authService.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('getStoredTokenFromRefreshTokenPayload', () => {
    it('check for malformed token', async () => {
      await expect(
        service.getStoredTokenFromRefreshTokenPayload({
          jwtid: null,
          subject: null
        })
      ).rejects.toThrowError(CustomHttpException);
    });

    it('get stored token from refresh token payload', async () => {
      repository.findTokenById.mockResolvedValue(refreshToken);
      await expect(
        service.getStoredTokenFromRefreshTokenPayload({
          jwtid: 1,
          subject: 1
        })
      ).resolves.not.toThrow();
      expect(repository.findTokenById).toHaveBeenCalledTimes(1);
    });
  });

  it('getRefreshTokenByUserId', async () => {
    const userId = 1;
    const filter: RefreshPaginateFilterDto = {
      limit: 10,
      page: 1
    };
    repository.getPaginationInfo.mockReturnValue({
      page: 1,
      limit: 10,
      skip: 1
    });
    repository.findAndCount.mockResolvedValue(['results', 'total']);
    await service.getRefreshTokenByUserId(userId, filter);
    expect(repository.findAndCount).toHaveBeenCalledTimes(1);
    expect(repository.transformMany).toHaveBeenCalledTimes(1);
  });

  describe('revokeRefreshTokenById', () => {
    it('revoke refresh token error for invalid id', async () => {
      repository.findTokenById.mockResolvedValue(null);
      await expect(service.revokeRefreshTokenById(1, 1)).rejects.toThrowError(
        NotFoundException
      );
      expect(repository.findTokenById).toHaveBeenCalledTimes(1);
    });

    it('revoke refresh token of another user', async () => {
      jest.spyOn(repository, 'findTokenById').mockResolvedValue({
        userId: 2,
        save: jest.fn()
      });
      await expect(service.revokeRefreshTokenById(1, 1)).rejects.toThrowError(
        ForbiddenException
      );
      expect(repository.findTokenById).toHaveBeenCalledTimes(1);
    });

    it('revoke refresh token for valid id', async () => {
      jest.spyOn(repository, 'findTokenById').mockResolvedValue({
        userId: 1,
        save: jest.fn()
      });
      const result = await service.revokeRefreshTokenById(1, 1);
      expect(repository.findTokenById).toHaveBeenCalledTimes(1);
      expect(result.save).toHaveBeenCalledTimes(1);
    });
  });
});
