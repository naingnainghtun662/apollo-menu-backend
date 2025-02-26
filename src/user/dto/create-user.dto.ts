import { ApiProperty } from '@nestjs/swagger';
import { role } from '@prisma/client';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsArray,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  roles: string[];
}
