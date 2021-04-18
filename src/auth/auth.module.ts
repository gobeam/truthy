import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import * as config from 'config';
import { UniqueValidatorPipe } from '../common/pipes/unique-validator.pipe';
import { MailModule } from '../mail/mail.module';

const jwtConfig = config.jwt;

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || jwtConfig.secret,
      signOptions: {
        expiresIn: jwtConfig.expiresIn
      }
    }),
    TypeOrmModule.forFeature([UserRepository]),
    MailModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UniqueValidatorPipe],
  exports: [JwtStrategy, PassportModule]
})
export class AuthModule {}
