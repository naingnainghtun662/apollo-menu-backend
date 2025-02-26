import {
  IsString,
  IsUUID,
  IsInt,
  IsPositive,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderType {
  DINE_IN = 'dine_in',
  TAKEAWAY = 'takeaway',
}

export class CreateOrderByCashierDto {
  @IsString()
  @IsUUID()
  tableId: string;

  @IsEnum(OrderType)
  type: OrderType;

  @IsArray()
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];
}

export class OrderItemDto {
  @IsString()
  @IsUUID()
  itemId: string;

  @IsString()
  @IsUUID()
  priceId: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsString()
  @IsOptional()
  specialInstructions: string = '';
}
