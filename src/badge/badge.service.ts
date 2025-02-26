import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';

@Injectable()
export class BadgeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createBadgeDto: CreateBadgeDto,
    tenantId: string,
    branchId: string,
  ) {
    return this.prisma.badge.create({
      data: { ...createBadgeDto, tenantId, branchId },
    });
  }

  async findAll() {
    return this.prisma.badge.findMany();
  }

  async findOne(id: string) {
    const badge = await this.prisma.badge.findUnique({
      where: { id },
    });

    if (!badge) {
      throw new NotFoundException(`Badge with ID ${id} not found`);
    }

    return badge;
  }

  async update(id: string, updateBadgeDto: UpdateBadgeDto) {
    const badge = await this.prisma.badge.update({
      where: { id },
      data: updateBadgeDto,
    });

    if (!badge) {
      throw new NotFoundException(`Badge with ID ${id} not found`);
    }

    return badge;
  }

  async remove(id: string) {
    const badge = await this.prisma.badge.delete({
      where: { id },
    });

    if (!badge) {
      throw new NotFoundException(`Badge with ID ${id} not found`);
    }

    return badge;
  }
}
