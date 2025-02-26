import {
  IsString,
  IsUUID,
  IsInt,
  IsPositive,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderType {
  DINE_IN = 'dine_in',
  TAKEAWAY = 'takeaway',
}

export class CreateOrderDto {
  @IsString()
  @IsUUID()
  tableId: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsEnum(OrderType)
  @IsOptional()
  type: OrderType;

  @IsOptional()
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
