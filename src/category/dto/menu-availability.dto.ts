import { ApiProperty } from '@nestjs/swagger';
import { day_of_week } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateMenuAvaibalityDto {
  //   @ApiProperty()
  //   @IsUUID()
  //   @IsNotEmpty()
  //   categoryId: string;

  @ApiProperty()
  @IsEnum(day_of_week)
  @IsNotEmpty()
  dayOfWeek: day_of_week;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  endTime: string;
}
