import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust based on your project structure
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  // Create a new tenant
  async create({ name, description }: CreateTenantDto) {
    try {
      const tenant = await this.prisma.tenant.create({
        data: {
          name,
          description,
        },
      });

      const branch = await this.prisma.branch.create({
        data: {
          tenantId: tenant.id,
          currency: 'MMK',
          name: tenant.name,
          phone: '00000000',
          email: `${name.toLowerCase().trim().replaceAll(' ', '_')}@gmail.com`,
          address: 'No 123, Main Street',
          radius: 10,
          lat: 12.3456789,
          long: 98.7654321,
          logoImageUrl: '',
          coverImageUrl: '',
        },
      });

      const superAdminName = `${name} Super Admin`;
      const superAdminEmail = `super_admin@${name.toLowerCase().trim().replaceAll(' ', '_')}.qrmenu.com`;
      const password = process.env.SUPER_ADMIN_PASSWORD;
      const superAdminRole = await this.prisma.role.findFirst({
        where: {
          name: 'super_admin',
        },
      });
      this.logger.log({
        password,
        branch,
        superAdminEmail,
        superAdminName,
        superAdminRole,
      });

      //create super admin
      if (superAdminRole && password) {
        await this.userService.create(
          {
            name: superAdminName,
            email: superAdminEmail,
            roles: [superAdminRole.id],
            password,
          },
          tenant.id,
          branch.id,
        );
      }

      //create user
      return tenant;
    } catch (error) {
      this.logger.log({ error });
      this.logger.error(error);
      throw new NotFoundException('Failed to create tenant');
    }
  }

  // Get all tenants
  async findAll() {
    return this.prisma.tenant.findMany({
      include: {
        branches: true,
      },
    });
  }

  // Get tenant by ID
  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  // Update tenant
  async update(id: string, { name }: CreateTenantDto) {
    const tenant = await this.prisma.tenant.update({
      where: { id },
      data: {
        name,
      },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  // Soft delete tenant
  async delete(id: string) {
    const tenant = await this.prisma.tenant.delete({
      where: { id },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }
}
