import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuItemService } from './menu-item.service';
import { UpdateMenuItemsPositionDto } from './dto/update-menu-item-position.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Role } from 'src/types';
import { Roles } from 'src/decorators/roles';

@Controller('/menu-items')
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMenuItemDto: CreateMenuItemDto) {
    return this.menuItemService.create(
      createMenuItemDto,
      'fd235e16-c83f-4575-8c58-6355c2ed730a',
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query('categoryId') categoryId: string) {
    return this.menuItemService.findAll(categoryId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.menuItemService.findOne(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    return this.menuItemService.update(id, updateMenuItemDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Patch('positions')
  async updatePositions(
    @Body() updatePositionsDto: UpdateMenuItemsPositionDto,
  ) {
    const { positions } = updatePositionsDto;
    return this.menuItemService.updatePositions(positions);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Patch(':id/out-of-stock')
  async updateMenuItemOutOfStock(
    @Param('id') id: string,
    @Body()
    updateOutOfStockDto: {
      outOfStock: boolean;
    },
  ) {
    console.log({ id });

    return this.menuItemService.updateMenuItemOutOfStock(
      id,
      updateOutOfStockDto.outOfStock,
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Patch(':id/out-of-stock/:variantId')
  async updateMenuItemVariantOutOfStock(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body()
    updateOutOfStockDto: {
      outOfStock: boolean;
    },
  ) {
    console.log({ variantId, id });
    return this.menuItemService.updateMenuItemVariantOutOfStock(
      id,
      variantId,
      updateOutOfStockDto.outOfStock,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.menuItemService.remove(id);
  }
}
