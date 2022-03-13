import { Test, TestingModule } from '@nestjs/testing';

import { PermissionGuard } from 'src/common/guard/permission.guard';
import { UserEntity } from 'src/auth/entity/user.entity';
import { RoleEntity } from 'src/role/entities/role.entity';
import { PermissionEntity } from 'src/permission/entities/permission.entity';

describe('Permission guard test', () => {
  let permissionGuard;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionGuard]
    }).compile();
    permissionGuard = module.get<PermissionGuard>(PermissionGuard);
    jest.clearAllMocks();
  });

  describe('check if user have necessary permission', () => {
    let context, mockPermission, mockRole, mockUser, mockSwitchToHttp;
    beforeEach(() => {
      context = {
        getArgByIndex: jest.fn(),
        getArgs: jest.fn(),
        getClass: jest.fn(),
        getHandler: jest.fn(),
        getType: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
        switchToHttp: jest.fn()
      };

      mockPermission = new PermissionEntity();
      mockPermission.method = 'get';
      mockPermission.path = '/roles/:id';

      mockRole = new RoleEntity();
      mockRole.name = 'tester';
      mockRole.permission = [mockPermission];

      mockUser = new UserEntity();
      mockUser.name = 'truthy';
      mockUser.username = 'truthy';
      mockUser.role = mockRole;

      mockSwitchToHttp = {
        getRequest: jest.fn(),
        getNext: jest.fn(),
        getResponse: jest.fn()
      };
    });
    it('check if permission is granted if user have valid permission', async () => {
      const requestMockData = {
        route: {
          path: '/roles/:id'
        },
        method: 'GET',
        user: mockUser
      };
      mockSwitchToHttp.getRequest.mockReturnValue(requestMockData);
      context.switchToHttp.mockReturnValue(mockSwitchToHttp);
      permissionGuard.checkIfDefaultRoute = jest.fn();
      const result = await permissionGuard.canActivate(context);
      expect(permissionGuard.checkIfDefaultRoute).toHaveBeenCalledTimes(1);
      expect(result).toBeTruthy();
    });

    it("check if permission is granted if user don't have valid permission", async () => {
      const requestMockData = {
        route: {
          path: '/permission/:id'
        },
        method: 'GET',
        user: mockUser
      };
      mockSwitchToHttp.getRequest.mockReturnValue(requestMockData);
      context.switchToHttp.mockReturnValue(mockSwitchToHttp);
      const result = await permissionGuard.canActivate(context);
      expect(result).toBeFalsy();
    });
  });
});
