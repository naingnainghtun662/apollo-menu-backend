// src/branch/dto/create-branch.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Currency } from 'src/types';

export class CreateBranchDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  radius: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  long: number;

  @ApiProperty()
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty()
  @IsString()
  @IsOptional()
  logoImageUrl?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  coverImageUrl?: string;
}
