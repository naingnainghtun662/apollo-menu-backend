import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private readonly prismaService: PrismaService) {}

  async getRoles() {
    return await this.prismaService.role.findMany({
      where: {
        name: {
          not: 'super_admin',
        },
      },
    });
  }
}
