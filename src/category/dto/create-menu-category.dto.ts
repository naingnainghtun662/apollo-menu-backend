import { IsString, IsOptional, IsNotEmpty, IsArray } from 'class-validator';
import { CreateMenuAvaibalityDto } from './menu-availability.dto';

export class CreateMenuCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  imageUrl: string;

  @IsArray()
  @IsOptional()
  availabilities: CreateMenuAvaibalityDto[];
}
