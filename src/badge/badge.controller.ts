import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { BadgeService } from './badge.service';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';

@Controller('badges')
export class BadgeController {
  constructor(private readonly badgeService: BadgeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createBadgeDto: CreateBadgeDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-branch-id') branchId: string,
  ) {
    return await this.badgeService.create(createBadgeDto, tenantId, branchId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.badgeService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.badgeService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateBadgeDto: UpdateBadgeDto,
  ) {
    return await this.badgeService.update(id, updateBadgeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return await this.badgeService.remove(id);
  }
}
