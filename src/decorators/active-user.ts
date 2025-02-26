import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ActiveUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user; // assuming the user is attached to the request object (after authentication middleware)
    return user;
  },
);
