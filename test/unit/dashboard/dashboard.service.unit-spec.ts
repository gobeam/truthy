import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { DashboardService } from 'src/dashboard/dashboard.service';

const authServiceMock = () => ({
  countByCondition: jest.fn(),
  getRefreshTokenGroupedData: jest.fn()
});

describe('DashboardService', () => {
  let service: DashboardService, authService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: AuthService,
          useFactory: authServiceMock
        }
      ]
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should get User Stat', () => {
    const result = service.getUserStat();
    expect(authService.countByCondition).toHaveBeenCalledTimes(3);
    expect(result).resolves.not.toThrow();
  });

  it('should get browser Stat', () => {
    service.getBrowserData();
    expect(authService.getRefreshTokenGroupedData).toHaveBeenCalledTimes(1);
    expect(authService.getRefreshTokenGroupedData).toHaveBeenCalledWith(
      'browser'
    );
  });

  it('should get os Stat', () => {
    service.getOsData();
    expect(authService.getRefreshTokenGroupedData).toHaveBeenCalledTimes(1);
    expect(authService.getRefreshTokenGroupedData).toHaveBeenCalledWith('os');
  });
});
