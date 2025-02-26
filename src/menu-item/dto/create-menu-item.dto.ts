import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsObject,
} from 'class-validator';
import { PriceDto } from './price.dto';

export class CreateMenuItemDto {
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
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  prices: PriceDto[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  addons: string[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  badges: string[]; //[badgeId]
}
