import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { TableDto } from './table-dto';

export class CreateTableDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  tables: TableDto[];
}
