import { Module } from '@nestjs/common';
import { TwofaService } from './twofa.service';
import { AuthModule } from '../auth/auth.module';
import { TwofaController } from './twofa.controller';

@Module({
  providers: [TwofaService],
  imports: [AuthModule],
  exports: [TwofaService],
  controllers: [TwofaController]
})
export class TwofaModule {}
