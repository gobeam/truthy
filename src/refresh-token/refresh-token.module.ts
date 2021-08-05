import { forwardRef, Module } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { RefreshTokenRepository } from './refresh-token.repository';

@Module({
  imports: [forwardRef(() => AuthModule), TypeOrmModule.forFeature([RefreshTokenRepository])],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
