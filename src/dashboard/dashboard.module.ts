import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [DashboardController],
  imports: [AuthModule],
  providers: [DashboardService]
})
export class DashboardModule {}
