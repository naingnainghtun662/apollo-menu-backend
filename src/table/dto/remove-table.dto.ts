import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class RemoveTableDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  tables: string[];
}
