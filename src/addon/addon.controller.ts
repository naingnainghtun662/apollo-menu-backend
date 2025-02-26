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
} from '@nestjs/common';
import { AddonService } from './addon.service';
// import { CreateAddonGroupDto } from './dto/addon-group.dto';
import { UpdateAddonGroupDto } from './dto/update-addon-group.dto';
// import { CreateAddonDto } from './dto/addon.dto';
// import { UpdateAddonDto } from './dto/update-addon.dto';
import { CreateAddonGroupAndAddonDto } from './dto/create-addon-and-group.dto';

@Controller('addons')
export class AddonController {
  constructor(private readonly addonService: AddonService) {}

  // AddonGroup Endpoints
  @Post('groups')
  @HttpCode(HttpStatus.CREATED)
  createAddonGroup(@Body() createAddonGroupDto: CreateAddonGroupAndAddonDto) {
    return this.addonService.createAddonGroup(
      createAddonGroupDto,
      'c15a0a5a-132a-48cf-9be9-305bcd428d3c',
      'c15a0a5a-132a-48cf-9be9-305bcd428d3c',
    );
  }

  // @Get('groups')
  // @HttpCode(HttpStatus.OK)
  // findAllAddonGroups() {
  //   return this.addonService.findAllAddonGroups();
  // }

  // @Get('groups/:id')
  // @HttpCode(HttpStatus.OK)
  // findOneAddonGroup(@Param('id') id: string) {
  //   return this.addonService.findOneAddonGroup(id);
  // }

  // @Patch('groups/:id')
  // @HttpCode(HttpStatus.OK)
  // updateAddonGroup(
  //   @Param('id') id: string,
  //   @Body() updateAddonGroupDto: UpdateAddonGroupDto,
  // ) {
  //   return this.addonService.updateAddonGroup(id, updateAddonGroupDto);
  // }

  // @Delete('groups/:id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // removeAddonGroup(@Param('id') id: string) {
  //   return this.addonService.removeAddonGroup(id);
  // }

  // // Addon Endpoints
  // @Post()
  // @HttpCode(HttpStatus.CREATED)
  // createAddon(@Body() createAddonDto: CreateAddonDto) {
  //   return this.addonService.createAddon(createAddonDto);
  // }

  // @Get(':groupId')
  // @HttpCode(HttpStatus.OK)
  // findAllAddons(@Param('groupId') groupId: string) {
  //   return this.addonService.findAllAddons(groupId);
  // }

  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // findOneAddon(@Param('id') id: string) {
  //   return this.addonService.findOneAddon(id);
  // }

  // @Patch(':id')
  // @HttpCode(HttpStatus.OK)
  // updateAddon(@Param('id') id: string, @Body() updateAddonDto: UpdateAddonDto) {
  //   return this.addonService.updateAddon(id, updateAddonDto);
  // }

  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // removeAddon(@Param('id') id: string) {
  //   return this.addonService.removeAddon(id);
  // }
}
