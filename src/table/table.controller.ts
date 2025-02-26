import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { TableService } from './table.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { RemoveTableDto } from './dto/remove-table.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/decorators/roles';
import { Role } from 'src/types';

@Controller('tables')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return this.tableService.findAll();
  }

  @Get('/filter/list')
  @HttpCode(HttpStatus.OK)
  async getTablesForFilter() {
    return this.tableService.getTablesForFilter();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.tableService.findOne(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTableDto: CreateTableDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-branch-id') branchId: string,
  ) {
    return this.tableService.create(createTableDto, tenantId, branchId);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateTableDto: UpdateTableDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-branch-id') branchId: string,
  ) {
    return this.tableService.update(tenantId, branchId, id, updateTableDto);
  }

  @Delete()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Body() removeTableDto: RemoveTableDto) {
    return this.tableService.remove(removeTableDto);
  }
}
