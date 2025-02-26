import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Headers,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiTags } from '@nestjs/swagger';
import { order_status } from '@prisma/client';
import { CreateOrderByCashierDto } from './dto/create-order-by-cashier.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // CREATE: Create a new order
  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Headers('x-uuid') uuid: string,
    @Headers('user-agent') userDevice: string,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-branch-id') branchId: string,
  ) {
    return await this.orderService.create(
      createOrderDto,
      uuid,
      tenantId,
      branchId,
      userDevice,
    );
  }

  @UseGuards(AuthGuard)
  @Post('/by-cashier')
  async createOrderByCashier(
    @Body() createOrderDto: CreateOrderByCashierDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-branch-id') branchId: string,
  ) {
    return await this.orderService.createOrderByCashier(
      createOrderDto,
      tenantId,
      branchId,
    );
  }

  // READ: Fetch all orders by tables
  @Get()
  async findAll(
    @Headers('x-branch-id') branchId: string,
    @Query('date') date: string,
    @Query('paid') paid: boolean,
    @Query('status') status: string,
    @Query('orderBy') orderBy: 'asc' | 'desc',
  ) {
    console.log({ date, paid, status, orderBy });
    const orderStatus =
      (status.split(',').map((st) => st.trim()) as order_status[]) || [];
    const orders = await this.orderService.findAll({
      branchId,
      date,
      paid,
      status: orderStatus,
      orderBy,
    });
    return orders;
  }

  @Get('filter/list')
  async filterOrders(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('page') page: number,
    @Query('orderNumber') orderNumber: number,
    @Query('tableIds') tableIdsStr: string,
    @Query('paid') paid: boolean,
  ) {
    const orders = await this.orderService.filterOrders({
      date: {
        startDate,
        endDate,
      },
      page,
      tableIds: tableIdsStr,
      orderNumber,
      paid,
    });
    return orders;
  }

  // READ: Fetch all orders by tables
  @Get('by-table')
  async getOrdersByTable(
    @Headers('x-branch-id') branchId: string,
    @Query('date') date: string,
    @Query('paid') paid: boolean,
  ) {
    const orders = await this.orderService.getOrdersByTable({
      branchId,
      date,
      paid,
    });
    return orders;
  }

  @Get('by-ids')
  async getOrdersByIds(@Query('orderIds') orderIdsStr: string) {
    const orderIds = orderIdsStr.split(',');
    const orders = await this.orderService.getOrdersByIds(orderIds);
    return orders;
  }

  // READ: Fetch a single order by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order = await this.orderService.findOne(id);
    return order;
  }

  @Get('table/has-unpaid')
  async hasUnpaidOrders(
    @Query('orderIds') orderIds: string,
    @Query('tableId') tableId: string,
  ) {
    const orderIdArray = orderIds.split(','); // Convert query string to an array
    console.log({ orderIdArray, tableId });
    const hasUnpaid = await this.orderService.hasUnpaidOrders({
      orderIds: orderIdArray,
      tableId,
    });
    return { hasUnpaid };
  }

  @Get('table/active-orders')
  async getTableActiveOrders(
    @Query('tableId') tableId: string,
    @Query('status') status: string,
  ) {
    const activeOrders = await this.orderService.getActiveTableOrders(
      tableId,
      status,
    );
    return activeOrders;
  }

  @Get('table/bill')
  async getActiveTableOrdersTotal(@Query('tableId') tableId: string) {
    const tableBillWithQuantity =
      await this.orderService.getTableBillWithQuantity(tableId);
    return tableBillWithQuantity;
  }

  @Get('table/active-orders-overview')
  async getTableActiveOrdersOverview(@Query('tableId') tableId: string) {
    const activeOrders =
      await this.orderService.getActiveTableOrdersOverview(tableId);
    return activeOrders;
  }

  // UPDATE: Update an order by ID
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    const order = await this.orderService.update(id, updateOrderDto);
    return { message: 'Order updated successfully', data: order };
  }

  @Patch('/table/:id/paid')
  async updatePaidStatus(
    @Param('id') tableId: string,
    @Body('paid') paid: boolean,
  ) {
    if (typeof paid !== 'boolean') {
      throw new Error('Invalid value for "paid". It must be a boolean.');
    }
    return this.orderService.updatePaidStatus(tableId, paid);
  }

  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body('status') status: string,
  ) {
    return this.orderService.updateOrderStatus(orderId, status as order_status);
  }

  // DELETE: Delete an order by ID
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.orderService.remove(id);
    return { message: 'Order deleted successfully' };
  }
}
