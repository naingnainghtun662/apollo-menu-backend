import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { Currency } from 'src/types';
import { PriceDto } from './price.dto';

export class MenuItemVariantDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsObject()
  price: PriceDto;
}
