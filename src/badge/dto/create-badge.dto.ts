import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBadgeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}
