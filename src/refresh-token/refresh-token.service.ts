import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignOptions, TokenExpiredError } from 'jsonwebtoken';
import { RefreshTokenRepository } from './refresh-token.repository';
import * as config from 'config';
import { RefreshTokenInterface } from './interface/refresh-token.interface';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuthService } from '../auth/auth.service';
import { UserSerializer } from '../auth/serializer/user.serializer';
import { InjectRepository } from '@nestjs/typeorm';

const appConfig = config.get('app');

const BASE_OPTIONS: SignOptions = {
  issuer: appConfig.appUrl,
  audience: appConfig.frontendUrl
};

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshTokenRepository)
    private readonly repository: RefreshTokenRepository,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly jwt: JwtService
  ) {}

  /**
   * Generate access token
   * @param user
   */
  public async generateAccessToken(user: UserSerializer): Promise<string> {
    const opts: SignOptions = {
      ...BASE_OPTIONS,
      subject: String(user.id)
    };

    return this.jwt.signAsync({}, opts);
  }

  /**
   * Generate refresh token
   * @param user
   * @param expiresIn
   */
  public async generateRefreshToken(
    user: UserSerializer,
    expiresIn: number
  ): Promise<string> {
    const token = await this.repository.createRefreshToken(user, expiresIn);

    const opts: SignOptions = {
      ...BASE_OPTIONS,
      expiresIn,
      subject: String(user.id),
      jwtid: String(token.id)
    };

    return this.jwt.signAsync({}, opts);
  }

  /**
   * Resolve encoded refresh token
   * @param encoded
   */
  public async resolveRefreshToken(
    encoded: string
  ): Promise<{ user: UserSerializer; token: RefreshToken }> {
    const payload = await this.decodeRefreshToken(encoded);
    const token = await this.getStoredTokenFromRefreshTokenPayload(payload);

    if (!token) {
      throw new BadRequestException('Refresh token not found');
    }

    if (token.isRevoked) {
      throw new BadRequestException('Refresh token revoked');
    }

    const user = await this.getUserFromRefreshTokenPayload(payload);

    if (!user) {
      throw new BadRequestException('Refresh token malformed');
    }

    return { user, token };
  }

  /**
   * Create access token from refresh token
   * @param refresh
   */
  public async createAccessTokenFromRefreshToken(
    refresh: string
  ): Promise<{ token: string; user: UserSerializer }> {
    const { user } = await this.resolveRefreshToken(refresh);

    const token = await this.generateAccessToken(user);

    return { user, token };
  }

  /**
   * Decode refresh token
   * @param token
   */
  async decodeRefreshToken(token: string): Promise<RefreshTokenInterface> {
    try {
      return await this.jwt.verifyAsync(token);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new BadRequestException('Refresh token expired');
      } else {
        throw new BadRequestException('Refresh token malformed');
      }
    }
  }

  /**
   * get user detail from refresh token
   * @param payload
   */
  async getUserFromRefreshTokenPayload(
    payload: RefreshTokenInterface
  ): Promise<UserSerializer> {
    const subId = payload.sub;

    if (!subId) {
      throw new BadRequestException('Refresh token malformed');
    }

    return this.authService.findById(subId);
  }

  /**
   * Get refresh token entity from token payload
   * @param payload
   */
  async getStoredTokenFromRefreshTokenPayload(
    payload: RefreshTokenInterface
  ): Promise<RefreshToken | null> {
    const tokenId = payload.jti;

    if (!tokenId) {
      throw new BadRequestException('Refresh token malformed');
    }

    return this.repository.findTokenById(tokenId);
  }
}
