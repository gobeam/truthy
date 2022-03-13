import { Module } from '@nestjs/common';

import { TwofaService } from 'src/twofa/twofa.service';
import { AuthModule } from 'src/auth/auth.module';
import { TwofaController } from 'src/twofa/twofa.controller';

@Module({
  providers: [TwofaService],
  imports: [AuthModule],
  exports: [TwofaService],
  controllers: [TwofaController]
})
export class TwofaModule {}
