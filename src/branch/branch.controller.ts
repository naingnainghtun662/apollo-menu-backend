import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Headers,
  Logger,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/decorators/roles';
import { Role } from 'src/types';

@Controller('branches')
export class BranchController {
  private readonly logger = new Logger(BranchController.name);
  constructor(private readonly branchService: BranchService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createBranchDto: CreateBranchDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    this.logger.log({ createBranchDto });
    const branch = await this.branchService.createBranch(
      createBranchDto,
      tenantId,
    );
    return branch;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('tenantId') tenantId: string) {
    return await this.branchService.getAllBranches(tenantId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    console.log({ id });
    const branch = await this.branchService.getBranchById(id);
    if (!branch) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Branch not found',
        data: null,
      };
    }
    return branch;
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateBranchDto: UpdateBranchDto,
  ) {
    return await this.branchService.updateBranch(id, updateBranchDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const branch = await this.branchService.deleteBranch(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Branch deleted successfully',
      data: branch,
    };
  }
}
