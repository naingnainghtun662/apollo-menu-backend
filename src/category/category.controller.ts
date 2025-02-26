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
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';
import { MenuCategoryService } from './category.service';
import { Roles } from 'src/decorators/roles';
import { Role } from 'src/types';
import { UpdateMenuCategoryPositionDto } from './dto/update-men-category-position';
import { Public } from 'src/decorators/public';
import { UpdateArchivedStatusDto } from './dto/update-archived-status.dto';
import { RolesGuard } from 'src/auth/role.guard';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('menu-categories')
export class MenuCategoryController {
  constructor(private readonly menuCategoryService: MenuCategoryService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createMenuCategoryDto: CreateMenuCategoryDto,
    @Headers('x-branch-id') branchId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    const category = await this.menuCategoryService.create(
      createMenuCategoryDto,
      tenantId,
      branchId,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Menu category created successfully',
      data: category,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Headers('x-branch-id') branchId: string) {
    return await this.menuCategoryService.findAll(branchId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.menuCategoryService.findOne(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Patch('positions')
  async updatePositions(
    @Body() updatePositionsDto: UpdateMenuCategoryPositionDto,
  ) {
    const { positions } = updatePositionsDto;
    return this.menuCategoryService.updatePositions(positions);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Patch(':id/archived')
  async updateArchivedStatus(
    @Param('id') id: string,
    @Body() updateArchivedStatusDto: UpdateArchivedStatusDto,
  ) {
    const { archived } = updateArchivedStatusDto;
    return this.menuCategoryService.updateArchivedStatus(id, archived);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateMenuCategoryDto: UpdateMenuCategoryDto,
  ) {
    const category = await this.menuCategoryService.update(
      id,
      updateMenuCategoryDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Menu category updated successfully',
      data: category,
    };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const category = await this.menuCategoryService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Menu category deleted successfully',
      data: category,
    };
  }
}
