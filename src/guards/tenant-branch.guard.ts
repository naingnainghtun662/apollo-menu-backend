import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class TenantBranchGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Extract tenantId and branchId from headers
    const tenantId = request.headers['x-tenant-id'];
    const branchId = request.headers['x-branch-id'];
    console.log({ tenantId, branchId });
    // If either is missing, throw an UnauthorizedException
    if (!(tenantId && branchId)) {
      throw new UnauthorizedException(
        'Missing tenantId or branchId in headers',
      );
    }

    // If present, allow the request
    return true;
  }
}
