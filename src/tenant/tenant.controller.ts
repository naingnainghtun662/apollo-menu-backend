// src/tenant/tenant.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Tenant, User, UserRole } from '@prisma/client';
import { ActiveUser } from 'src/decorators/active-user';
import { AuthGuard } from 'src/auth/auth.guard';
import { ActiveUserRoles } from 'src/decorators/active-user-roles';
import { RolesGuard } from 'src/auth/role.guard';
import { Role } from 'src/types';
import { Roles } from 'src/decorators/roles';

@ApiTags('tenants')
@Controller('tenants')
export class TenantController {
  private readonly logger = new Logger(TenantController.name);
  constructor(private readonly tenantService: TenantService) {}

  // Create a new tenant
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'The tenant has been successfully created.',
    // type: Tenant,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation failed.',
  })
  async create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto);
  }

  // Get all tenants
  @Get()
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles(Role.SUPER_ADMIN)
  @ApiResponse({
    status: 200,
    description: 'List of all tenants.',
    // type: [Tenant],
  })
  async findAll() {
    return this.tenantService.findAll();
  }

  // Get tenant by ID
  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'The tenant has been successfully found.',
    // type: Tenant,
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant not found.',
  })
  async findOne(@Param('id') id: string): Promise<Tenant> {
    return this.tenantService.findOne(id);
  }

  // Update tenant by ID
  @Patch(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'The tenant has been successfully updated.',
    // type: Tenant,
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant not found.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: CreateTenantDto,
  ): Promise<Tenant> {
    return this.tenantService.update(id, updateTenantDto);
  }

  // Soft delete tenant by ID
  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'The tenant has been successfully deleted.',
    // type: Tenant,
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant not found.',
  })
  async delete(@Param('id') id: string): Promise<Tenant> {
    return this.tenantService.delete(id);
  }
}
