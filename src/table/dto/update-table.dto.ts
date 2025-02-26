import { PartialType } from '@nestjs/swagger';
import { TableDto } from './table-dto';

export class UpdateTableDto extends PartialType(TableDto) {}
