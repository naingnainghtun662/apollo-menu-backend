import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsUUID } from 'class-validator';

export class UpdateArchivedStatusDto {
  @ApiProperty()
  @IsBoolean()
  archived: boolean;
}
