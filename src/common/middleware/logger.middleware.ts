import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PermissionConfiguration } from '../../config/permission-config';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const path = req.route.path;
    const permitted = this.checkIfDefaultRoute(path, req.method);
    console.log(req);
    next();
  }

  checkIfDefaultRoute(path: string, method: string) {
    const defaultRoutes = PermissionConfiguration.defaultRoutes;
    return defaultRoutes.some(
      (route) => route.path === path && route.method.toUpperCase() === method
    );
  }
}
