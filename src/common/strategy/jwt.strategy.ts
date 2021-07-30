import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as config from 'config';
import { UserRepository } from '../../auth/user.repository';
import { UserEntity } from '../../auth/entity/user.entity';
import { JwtPayloadDto } from '../../auth/dto/jwt-payload.dto';

const cookieExtractor = (req) => {
  return req?.cookies?.Authentication;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-strategy') {
  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: process.env.JWT_SECRET || config.get('jwt.secret')
    });
  }

  /**
   * Validate if user exists and return user entity
   * @param payload
   */
  async validate(payload: JwtPayloadDto): Promise<UserEntity> {
    const { sub } = payload;
    const user = await this.userRepository.findOne(Number(sub), {
      relations: ['role', 'role.permission']
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
