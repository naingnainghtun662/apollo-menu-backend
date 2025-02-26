import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateMenuItemsPositionDto } from './dto/update-menu-item-position.dto';

@Injectable()
export class MenuItemService {
  private readonly logger = new Logger(MenuItemService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(createMenuItemDto: CreateMenuItemDto, branchId: string) {
    const { prices, name, description, categoryId, addons, imageUrl } =
      createMenuItemDto;
    this.logger.log({ createMenuItemDto });
    //did not the use the next_val(sequence_name)
    //as we want to start from 1 for position for a different tenant
    //current total category position for this branch
    const total =
      (await this.prisma.menuItem.count({
        where: {
          branchId,
          categoryId,
          deletedAt: null,
        },
      })) || 0;

    //create item
    const menuItem = await this.prisma.menuItem.create({
      data: {
        name,
        description,
        position: total + 1,
        imageUrl,
        categoryId,
        branchId,
      },
    });

    //saved prices
    if (prices && prices.length > 0) {
      await this.prisma.menuItemPrice.createMany({
        data: prices.map(({ name, price, currency }) => ({
          name,
          price,
          currency,
          itemId: menuItem.id,
        })),
      });
    }

    if (addons && addons.length > 0) {
      await this.prisma.menuItemAddon.createMany({
        data: addons.map((addon) => ({
          itemId: menuItem.id,
          addonId: addon,
        })),
      });
    }

    return menuItem;
  }

  async findAll(categoryId: string) {
    return this.prisma.menuItem.findMany({
      where: {
        categoryId,
      },
      include: {
        prices: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            outOfStock: 'asc', // false comes before true
          },
        },
      },
      orderBy: [{ createdAt: 'asc' }, { position: 'asc' }],
    });
  }

  async findOne(id: string) {
    const menuItem = await this.prisma.menuItem.findFirst({
      where: { id },
      include: {
        prices: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            outOfStock: 'asc', // false comes before true
          },
        },
      },
    });

    if (!menuItem) {
      throw new NotFoundException(`MenuItem with ID ${id} not found`);
    }

    return menuItem;
  }

  async update(id: string, updateMenuItemDto: UpdateMenuItemDto) {
    this.logger.log({ updateMenuItemDto });
    const { name, description, imageUrl, addons, prices } = updateMenuItemDto;
    const menuItem = await this.prisma.menuItem.findFirst({
      where: { id },
    });

    if (!menuItem) {
      throw new NotFoundException(`MenuItem with ID ${id} not found`);
    }

    //saved new prices
    if (prices?.new && prices.new.length > 0) {
      await this.prisma.menuItemPrice.createMany({
        data: prices.new.map(({ name, price, currency }) => ({
          name,
          price,
          currency,
          itemId: id,
        })),
      });
    }

    //remove prices
    if (prices?.removed && prices.removed.length > 0) {
      await this.prisma.menuItemPrice.deleteMany({
        where: {
          itemId: id,
          id: {
            in: prices.removed,
          },
        },
      });
    }

    //update previous price name or amount or currency
    if (prices?.previous && prices.previous.length > 0) {
      await Promise.all(
        prices.previous.map(async (prev) => {
          return await this.prisma.menuItemPrice.update({
            where: {
              id: prev.id,
              itemId: id,
            },
            data: {
              name: prev.name,
              price: prev.price,
              currency: prev.currency,
            },
          });
        }),
      );
    }

    //remove addons
    if (addons?.removed && addons.removed.length > 0) {
      await this.prisma.menuItemAddon.deleteMany({
        where: {
          addonId: {
            in: addons.removed,
          },
        },
      });
    }

    //save new added addons
    if (addons?.new && addons.new.length > 0) {
      await this.prisma.menuItemAddon.createMany({
        data: addons.new.map((addon) => ({
          itemId: menuItem.id,
          addonId: addon,
        })),
      });
    }

    return await this.prisma.menuItem.update({
      where: { id },
      data: {
        name: name || menuItem.name,
        description: description || menuItem.description,
        imageUrl: imageUrl || menuItem.imageUrl,
      },
      include: {
        prices: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }

  async updatePositions(positions: { id: string; position: number }[]) {
    const updates = positions.map(({ id, position }) =>
      this.prisma.menuItem.update({
        where: { id },
        data: { position },
      }),
    );
    await this.prisma.$transaction(updates); // Ensure all updates are atomic
    return { success: true };
  }

  async updateMenuItemOutOfStock(id: string, outOfStock: boolean) {
    return this.prisma.$transaction(async (tx) => {
      await tx.menuItemPrice.updateMany({
        where: {
          itemId: id,
        },
        data: { outOfStock },
      });

      await tx.menuItem.update({
        where: { id },
        data: { outOfStock },
      });

      return { success: true };
    });
  }

  async updateMenuItemVariantOutOfStock(
    itemId: string,
    variantId: string,
    outOfStock: boolean,
  ) {
    console.log({ itemId, variantId, outOfStock });
    return this.prisma.$transaction(async (tx) => {
      const menuItem = await tx.menuItem.findFirstOrThrow({
        where: { id: itemId },
      });

      await tx.menuItemPrice.update({
        where: { id: variantId, itemId },
        data: { outOfStock },
      });

      // Check if all variants of the item are out of stock
      const availableVariants = await tx.menuItemPrice.findMany({
        where: { itemId, outOfStock: false },
      });
      console.log({ availableVariants });

      if (availableVariants.length === 0) {
        await tx.menuItem.update({
          where: { id: itemId },
          data: { outOfStock: true },
        });
      } else if (!outOfStock && menuItem.outOfStock) {
        // If a variant is marked as in stock and the item is currently out of stock, update the item status
        await tx.menuItem.update({
          where: { id: itemId },
          data: { outOfStock: false },
        });
      }

      return { success: true };
    });
  }

  async remove(id: string) {
    const menuItem = await this.prisma.menuItem.findFirst({
      where: { id },
    });

    if (!menuItem) {
      throw new NotFoundException(`MenuItem with ID ${id} not found`);
    }

    // Get the position of the item to be deleted
    const positionToDelete = menuItem.position;

    // Update the positions of items after the deleted item
    await this.prisma.menuItem.updateMany({
      where: {
        position: { gt: positionToDelete },
      },
      data: {
        position: {
          decrement: 1,
        },
      },
    });

    // Now delete the menu item
    return this.prisma.menuItem.delete({
      where: { id },
    });
  }
}
