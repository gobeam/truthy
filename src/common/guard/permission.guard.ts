import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PermissionConfiguration } from '../../config/permission-config';

@Injectable()
export class PermissionGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const path = request.route.path;
    // console.log(path, request.user);
    const permitted = this.checkIfDefaultRoute(path, request.method);
    return permitted;
  }

  checkIfDefaultRoute(path: string, method: string) {
    const defaultRoutes = PermissionConfiguration.defaultRoutes;
    return defaultRoutes.some(
      (route) => route.path === path && route.method.toUpperCase() === method
    );
  }
}
