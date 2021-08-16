import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import JwtTwoFactorGuard from '../common/guard/jwt-two-factor.guard';
import { PermissionGuard } from '../common/guard/permission.guard';
import { DashboardService } from './dashboard.service';
import { OsStatsInterface } from './interface/os-stats.interface';
import { UsersStatsInterface } from './interface/user-stats.interface';
import { BrowserStatsInterface } from './interface/browser-stats.interface';

@ApiTags('dashboard')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/users')
  userStat(): Promise<UsersStatsInterface> {
    return this.dashboardService.getUserStat();
  }

  @Get('/os')
  osStat(): Promise<Array<OsStatsInterface>> {
    return this.dashboardService.getOsData();
  }

  @Get('/browser')
  browserStat(): Promise<Array<BrowserStatsInterface>> {
    return this.dashboardService.getBrowserData();
  }
}
