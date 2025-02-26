import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class TableDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
