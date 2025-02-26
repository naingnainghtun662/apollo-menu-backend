import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/decorators/public';
import { PrismaService } from 'src/prisma/prisma.service';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prismaService: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );
    if (isPublic) {
      return true; // Allow access without authentication
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    console.log({ token });
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    // Validate the token with Supabase
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.getUser(token);

    console.log({ data, error });
    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        id: data.user.id,
      },
      include: {
        roles: {
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    console.log({ user });
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Attach user info to the request for further use
    request.user = user;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader) return null;

    const [bearer, token] = authHeader.split(' ');
    return bearer === 'Bearer' && token ? token : null;
  }
}
