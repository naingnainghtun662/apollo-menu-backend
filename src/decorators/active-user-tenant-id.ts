import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

export const ActiveUserTenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as User; // assuming the user is attached to the request object (after authentication middleware)
    return user['tenantId'] || '';
  },
);
