import { Module } from '@nestjs/common';
import { DashboardService } from 'src/dashboard/dashboard.service';
import { DashboardController } from 'src/dashboard/dashboard.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [DashboardController],
  imports: [AuthModule],
  providers: [DashboardService]
})
export class DashboardModule {}
