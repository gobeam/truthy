import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';
import { AuthModule } from 'src/auth/auth.module';
import { RefreshTokenRepository } from 'src/refresh-token/refresh-token.repository';
import { RefreshToken } from './entities/refresh-token.entity';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([RefreshToken])
  ],
  providers: [RefreshTokenRepository, RefreshTokenService],
  exports: [RefreshTokenService],
  controllers: []
})
export class RefreshTokenModule {}
