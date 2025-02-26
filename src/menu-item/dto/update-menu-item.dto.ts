import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsObject,
} from 'class-validator';
import { PriceDto } from './price.dto';
import { MenuItemPrice } from '@prisma/client';

export class UpdateMenuItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  imageUrl: string;

  @ApiProperty()
  @IsObject()
  prices: {
    previous: PriceDto[];
    new: PriceDto[];
    removed: string[]; //[id]
  };

  @ApiProperty()
  @IsObject()
  @IsOptional()
  addons: {
    new: string[];
    removed: string[];
  };
}
