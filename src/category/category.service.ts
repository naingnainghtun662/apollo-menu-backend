import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MenuCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new menu category
  async create(
    createMenuCategoryDto: CreateMenuCategoryDto,
    tenantId: string,
    branchId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Missing required tenantId.');
    }

    if (!tenantId) {
      throw new BadRequestException('Missing required branchId.');
    }

    // const { availabilities = [], ...other } = createMenuCategoryDto;
    const { name, description, imageUrl } = createMenuCategoryDto;

    //did not the use the next_val(sequence_name)
    //as we want to start from 1 for position for a different tenant
    //current total category position for this branch
    const total =
      (await this.prisma.menuCategory.count({
        where: {
          branchId,
          tenantId,
          deletedAt: null,
        },
      })) || 0;

    return this.prisma.$transaction(async (prisma) => {
      // Create the menu category
      const category = await prisma.menuCategory.create({
        data: {
          name,
          description,
          imageUrl: imageUrl || '',
          position: total + 1,
          tenantId,
          branchId,
          isArchived: false,
        },
      });

      // If there are availabilities, add them
      // if (availabilities && availabilities?.length > 0) {
      //   await prisma.menuCategoryAvailability.createMany({
      //     data: availabilities.map((availability) => ({
      //       ...availability,
      //       startTime: new Date(`1970-01-01T${availability.startTime}Z`),
      //       endTime: new Date(`1970-01-01T${availability.endTime}Z`),
      //       categoryId: category.id,
      //     })),
      //   });
      // }

      // Return the created category
      return category;
    });
  }

  // Get all menu categories
  async findAll(branchId: string) {
    return this.prisma.menuCategory.findMany({
      where: { branchId, deletedAt: null },
      orderBy: { position: 'asc' },
    });
  }

  // Get a single menu category by ID
  async findOne(id: string) {
    const category = await this.prisma.menuCategory.findUnique({
      where: { id },
      include: {
        // availabilities: true,
        items: {
          where: { deletedAt: null },
          include: {
            prices: {
              where: {
                deletedAt: null,
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });
    if (!category) {
      throw new NotFoundException(`Menu category with ID ${id} not found`);
    }
    return category;
  }

  // Update a menu category by ID
  async update(id: string, updateMenuCategoryDto: UpdateMenuCategoryDto) {
    const { availabilities, ...other } = updateMenuCategoryDto;
    const category = await this.prisma.menuCategory.update({
      where: { id },
      data: other,
    });
    if (!category) {
      throw new NotFoundException(`Menu category with ID ${id} not found`);
    }
    return category;
  }

  async updatePositions(positions: { id: string; position: number }[]) {
    const updates = positions.map(({ id, position }) =>
      this.prisma.menuCategory.update({
        where: { id },
        data: { position },
      }),
    );
    await this.prisma.$transaction(updates); // Ensure all updates are atomic
    return { success: true };
  }

  async updateArchivedStatus(id: string, archived: boolean) {
    return await this.prisma.menuCategory.update({
      where: { id },
      data: { isArchived: archived },
    });
  }

  // Delete a menu category by ID
  async remove(id: string) {
    console.log({ id });
    const category = await this.prisma.menuCategory.delete({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Menu category with ID ${id} not found`);
    }
    return category;
  }
}
