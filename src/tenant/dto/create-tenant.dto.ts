import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { supported_language } from '@prisma/client';

export class CreateTenantDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;
}
