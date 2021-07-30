import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as config from 'config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../../auth/user.repository';
import { UserEntity } from '../../auth/entity/user.entity';
import { JwtPayloadDto } from '../../auth/dto/jwt-payload.dto';

@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(
  Strategy,
  'jwt-two-factor'
) {
  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Authentication;
        }
      ]),
      secretOrKey: process.env.JWT_SECRET || config.get('jwt.secret')
    });
  }

  async validate(payload: JwtPayloadDto): Promise<UserEntity> {
    const { isTwoFAAuthenticated, sub } = payload;
    const user = await this.userRepository.findOne(Number(sub), {
      relations: ['role', 'role.permission']
    });
    if (!user.isTwoFAEnabled) {
      return user;
    }
    if (isTwoFAAuthenticated) {
      return user;
    }
    throw new HttpException(
      {
        message: 'otpRequired',
        statusCode: HttpStatus.FORBIDDEN,
        error: true
      },
      HttpStatus.FORBIDDEN
    );
  }
}
