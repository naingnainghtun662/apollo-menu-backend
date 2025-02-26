import {
  IsString,
  IsUUID,
  IsInt,
  IsPositive,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(['cooking', 'in_kitchen', 'completed'])
  status?: 'cooking' | 'in_kitchen' | 'completed';

  @IsOptional()
  @IsBoolean()
  paid?: boolean;
}
