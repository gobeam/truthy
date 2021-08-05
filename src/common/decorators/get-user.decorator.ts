import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * get logged user custom decorator
 */
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
