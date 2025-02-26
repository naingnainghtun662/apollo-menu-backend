import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAddonGroupDto } from './dto/update-addon-group.dto';
// import { UpdateAddonDto } from './dto/update-addon.dto';
import { CreateAddonGroupAndAddonDto } from './dto/create-addon-and-group.dto';

@Injectable()
export class AddonService {
  private readonly logger = new Logger(AddonService.name);
  constructor(private readonly prisma: PrismaService) {}

  // AddonGroup Methods
  async createAddonGroup(
    createAddonAndGroupDto: CreateAddonGroupAndAddonDto,
    tenantId: string,
    branchId: string,
  ) {
    const { newGroups } = createAddonAndGroupDto;
    this.logger.log({ newGroups });
    //create new addon groups and addons
    await Promise.all(
      newGroups.map(async ({ name, addons }) => {
        //check
        const savedGroup = await this.prisma.addonGroup.create({
          data: {
            name,
            tenantId,
            branchId,
          },
        });
        //saved group addons

        await Promise.all(
          addons.map(async ({ name, price, currency }) => {
            await this.prisma.addon.create({
              data: {
                groupId: savedGroup.id,
                name: name,
                price,
                currency,
              },
            });
          }),
        );
      }),
    );
  }

  // async findAllAddonGroups() {
  //   return this.prisma.addonGroup.findMany();
  // }

  // async findOneAddonGroup(id: string) {
  //   const group = await this.prisma.addonGroup.findUnique({ where: { id } });
  //   if (!group) {
  //     throw new NotFoundException(`Addon group with ID ${id} not found`);
  //   }
  //   return group;
  // }

  // async updateAddonGroup(id: string, updateAddonGroupDto: UpdateAddonGroupDto) {
  //   return this.prisma.addonGroup.update({
  //     where: { id },
  //     data: updateAddonGroupDto,
  //   });
  // }

  // async removeAddonGroup(id: string) {
  //   return this.prisma.addonGroup.delete({ where: { id } });
  // }

  // // Addon Methods
  // async createAddon(createAddonDto: CreateAddonDto) {
  //   return this.prisma.addon.create({
  //     data: createAddonDto,
  //   });
  // }

  // async findAllAddons(groupId: string) {
  //   return this.prisma.addon.findMany({
  //     where: { groupId },
  //   });
  // }

  // async findOneAddon(id: string) {
  //   const addon = await this.prisma.addon.findUnique({ where: { id } });
  //   if (!addon) {
  //     throw new NotFoundException(`Addon with ID ${id} not found`);
  //   }
  //   return addon;
  // }

  // async updateAddon(id: string, updateAddonDto: UpdateAddonDto) {
  //   return this.prisma.addon.update({
  //     where: { id },
  //     data: updateAddonDto,
  //   });
  // }

  // async removeAddon(id: string) {
  //   return this.prisma.addon.delete({ where: { id } });
  // }
}
