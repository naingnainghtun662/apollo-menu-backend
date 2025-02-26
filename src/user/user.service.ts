import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  // Create a new user
  async create(
    createUserDto: CreateUserDto,
    tenantId: string,
    branchId?: string,
  ) {
    const { email, password, roles, name } = createUserDto;
    //create user in supabase auth schema and then create in public schema
    const { data, error } = await this.supabase.getClient().auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          tenantId,
          branchId,
        },
      },
    });

    if (error) {
      throw new HttpException(
        error.message || 'Failed to create user.',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!data.user) {
      throw new HttpException(
        'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return this.prisma.user.create({
      data: {
        id: data.user.id,
        tenantId,
        branchId,
        name,
        email,
        roles: {
          createMany: {
            data: roles.map((roleId) => ({
              roleId, // Reference to existing Role ID
            })),
          },
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  // Get all users
  async findAll({
    tenantId,
    branchId,
  }: {
    tenantId: string;
    branchId: string;
  }) {
    return this.prisma.user.findMany({
      where: {
        tenantId,
        branchId,
        roles: {
          some: {
            role: {
              name: {
                not: 'super_admin',
              },
            },
          },
        },
      },
      include: {
        roles: {
          include: { role: true },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  // Get a user by ID
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // Update a user
  async update(id: string, updateUserDto: UpdateUserDto) {
    const { name, email, password, roles } = updateUserDto;

    // Fetch user from Supabase Authentication
    const { data, error } = await this.supabase
      .getClient()
      .auth.admin.getUserById(id);

    if (error || !data.user) {
      throw new NotFoundException(`User with id ${id} not found.`);
    }

    // Prepare update payload for Supabase Authentication
    const updatePayload: any = {
      user_metadata: {
        ...data.user.user_metadata,
        name,
      },
    };

    if (email && data.user.email !== email) {
      updatePayload.email = email;
    }

    if (password) {
      updatePayload.password = password;
    }

    // Update user in Supabase Authentication
    await this.supabase
      .getClient()
      .auth.admin.updateUserById(id, updatePayload);

    // Update user in system user table
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        roles: {
          deleteMany: {},
          create: roles.map((roleId) => ({ roleId })),
        },
      },
    });

    return user;
  }

  // Delete a user
  async remove(id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .auth.admin.deleteUser(id, true);
    if (error) {
      throw new HttpException(
        error?.message || 'Failed to delete user.',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!data.user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const user = await this.prisma.user.delete({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
