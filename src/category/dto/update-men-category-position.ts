import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

class UpdatePosition {
  @IsString()
  id: string;

  @IsInt()
  position: number;
}

export class UpdateMenuCategoryPositionDto {
  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePosition)
  positions: UpdatePosition[];
}
