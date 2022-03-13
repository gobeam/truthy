import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';
import { AuthModule } from 'src/auth/auth.module';
import { RefreshTokenRepository } from 'src/refresh-token/refresh-token.repository';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([RefreshTokenRepository])
  ],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService],
  controllers: []
})
export class RefreshTokenModule {}
