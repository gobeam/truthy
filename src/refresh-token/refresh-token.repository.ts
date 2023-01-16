import { DataSource } from 'typeorm';
import config from 'config';
import { Injectable } from '@nestjs/common';

import { RefreshToken } from 'src/refresh-token/entities/refresh-token.entity';
import { UserSerializer } from 'src/auth/serializer/user.serializer';
import { BaseRepository } from 'src/common/repository/base.repository';
import { RefreshTokenSerializer } from 'src/refresh-token/serializer/refresh-token.serializer';
import { UserEntity } from 'src/auth/entity/user.entity';

const tokenConfig = config.get('jwt');
@Injectable()
export class RefreshTokenRepository extends BaseRepository<
  RefreshToken,
  RefreshTokenSerializer
> {
  constructor(private dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  /**
   * Create refresh token
   * @param user
   * @param tokenPayload
   */
  public async createRefreshToken(
    user: UserSerializer,
    tokenPayload: Partial<RefreshToken>
  ): Promise<RefreshToken> {
    const token = this.dataSource.getRepository(RefreshToken);
    const expiration = new Date();
    expiration.setSeconds(
      expiration.getSeconds() + tokenConfig.refreshExpiresIn
    );
    return token.save({
      userId: user.id,
      isRevoked: false,
      ip: tokenPayload.ip,
      userAgent: tokenPayload.userAgent,
      browser: tokenPayload.browser,
      os: tokenPayload.os,
      expires: expiration
    });
  }

  /**
   * find token by id
   * @param id
   */
  public async findTokenById(id: number): Promise<RefreshToken | null> {
    return this.findOne({
      where: {
        id
      }
    });
  }
}
