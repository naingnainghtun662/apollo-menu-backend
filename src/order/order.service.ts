import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library'; // Import Decimal for accurate calculations
import { EventsGateway } from 'src/events/events.gateway';
import { Order, order_status } from '@prisma/client';
import { CreateOrderByCashierDto } from './dto/create-order-by-cashier.dto';
import { isBoolean } from 'class-validator';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    private prisma: PrismaService,
    private wsGateway: EventsGateway,
  ) {}

  // CREATE: Create a new order

  async create(
    createOrderDto: CreateOrderDto,
    userId: string,
    tenantId: string,
    branchId: string,
    userDevice: string,
  ) {
    this.logger.log({
      createOrderDto,
      userDevice,
      userId,
      tenantId,
      branchId,
    });

    const { orderItems, tableId, latitude, longitude } = createOrderDto;

    // Fetch branch details to check radius
    const branch = await this.prisma.branch.findFirstOrThrow({
      where: { id: branchId },
      select: { lat: true, long: true, radius: true },
    });

    const table = await this.prisma.table.findFirstOrThrow({
      where: { id: tableId },
    });

    // Validate user location
    const userDistance = this.calculateUserDistanceFromRestaurant(
      latitude,
      longitude,
      branch.lat,
      branch.long,
    );

    // if (userDistance > branch.radius) {
    //   throw new HttpException(
    //     `You cannot order from outside of the allowed order range. Please stay within the allowed range (${branch.radius} meters).`,
    //     HttpStatus.FORBIDDEN,
    //   );
    // }

    // Check if any ordered items are out of stock
    const priceIds = orderItems.map((item) => item.priceId);
    const outOfStockItems = await this.prisma.menuItemPrice.findMany({
      where: { id: { in: priceIds }, outOfStock: true },
      select: { id: true },
    });

    if (outOfStockItems.length > 0) {
      throw new HttpException(
        'One or more items in your order are out of stock.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Fetch prices and calculate order total
    const menuItemsPrices = await this.prisma.menuItemPrice.findMany({
      where: { id: { in: priceIds } },
      select: { id: true, price: true },
    });

    const priceMap = new Map(
      menuItemsPrices.map((p) => [p.id, new Decimal(p.price)]),
    );

    let subTotal = new Decimal(0);
    let tax = new Decimal(0);
    let totalQuantity = 0;

    const orderItemsData = orderItems.map(
      ({ itemId, priceId, quantity, specialInstructions }) => {
        const itemPrice = priceMap.get(priceId) ?? new Decimal(0);
        const itemTotal = itemPrice.times(quantity);

        subTotal = subTotal.plus(itemTotal);
        tax = tax.plus(itemTotal.times(0.1)); // 10% tax
        totalQuantity = totalQuantity + quantity;
        return {
          priceId,
          itemId,
          quantity,
          total: itemTotal.toFixed(2),
          specialInstructions: specialInstructions || '',
        };
      },
    );

    const total = subTotal.plus(tax);
    const roundedSubTotal = subTotal.toFixed(2);
    const roundedTax = tax.toFixed(2);
    const roundedTotal = total.toFixed(2);

    const branchLastOrderNumber =
      await this.prisma.branchLastOrderNumber.findFirst({
        where: { branchId, tenantId },
      });

    const orderNumber = branchLastOrderNumber
      ? branchLastOrderNumber.lastOrderNumber + 1
      : 1;

    console.log({ orderNumber });

    const createdOrder = await this.prisma.$transaction(
      async (prisma) => {
        if (!branchLastOrderNumber) {
          await prisma.branchLastOrderNumber.create({
            data: { tenantId, branchId, lastOrderNumber: orderNumber },
          });
        } else {
          await prisma.branchLastOrderNumber.update({
            where: { id: branchLastOrderNumber.id },
            data: { lastOrderNumber: orderNumber },
          });
        }

        const createdOrder = await prisma.order.create({
          data: {
            tableId: table.id,
            userDevice,
            userId,
            tenantId,
            branchId,
            quantity: totalQuantity,
            orderNumber,
            subTotal: new Decimal(roundedSubTotal),
            tax: new Decimal(roundedTax),
            total: new Decimal(roundedTotal),
            orderItems: { createMany: { data: orderItemsData } },
            status: 'in_kitchen',
          },
          include: {
            table: true,
            orderItems: {
              include: { menuItem: { include: { prices: true } } },
            },
          },
        });

        return createdOrder;
      },
      {
        timeout: 10000,
        maxWait: 10000,
      },
    );

    // Notify client
    this.wsGateway.server
      .to([branchId])
      .emit('newOrder', { order: createdOrder });
  }

  async createOrderByCashier(
    createOrderDto: CreateOrderByCashierDto,
    tenantId: string,
    branchId: string,
  ) {
    this.logger.log({
      createOrderDto,
      tenantId,
      branchId,
    });

    const { orderItems, tableId, type } = createOrderDto;

    // Fetch branch details to check radius
    const branch = await this.prisma.branch.findFirstOrThrow({
      where: { id: branchId },
      select: { lat: true, long: true, radius: true },
    });

    const table = await this.prisma.table.findFirstOrThrow({
      where: { id: tableId },
    });

    // Check if any ordered items are out of stock
    const priceIds = orderItems.map((item) => item.priceId);
    const outOfStockItems = await this.prisma.menuItemPrice.findMany({
      where: { id: { in: priceIds }, outOfStock: true },
      select: { id: true },
    });

    if (outOfStockItems.length > 0) {
      throw new HttpException(
        'One or more items in your order are out of stock.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Fetch prices and calculate order total
    const menuItemsPrices = await this.prisma.menuItemPrice.findMany({
      where: { id: { in: priceIds } },
      select: { id: true, price: true },
    });

    const priceMap = new Map(
      menuItemsPrices.map((p) => [p.id, new Decimal(p.price)]),
    );

    let subTotal = new Decimal(0);
    let tax = new Decimal(0);
    let totalQuantity = 0;

    const orderItemsData = orderItems.map(
      ({ itemId, priceId, quantity, specialInstructions }) => {
        const itemPrice = priceMap.get(priceId) ?? new Decimal(0);
        const itemTotal = itemPrice.times(quantity);

        subTotal = subTotal.plus(itemTotal);
        tax = tax.plus(itemTotal.times(0.1)); // 10% tax
        totalQuantity = totalQuantity + quantity;
        return {
          priceId,
          itemId,
          quantity,
          total: itemTotal.toFixed(2),
          specialInstructions: specialInstructions || '',
        };
      },
    );

    const total = subTotal.plus(tax);
    const roundedSubTotal = subTotal.toFixed(2);
    const roundedTax = tax.toFixed(2);
    const roundedTotal = total.toFixed(2);

    const branchLastOrderNumber =
      await this.prisma.branchLastOrderNumber.findFirst({
        where: { branchId, tenantId },
      });

    const orderNumber = branchLastOrderNumber
      ? branchLastOrderNumber.lastOrderNumber + 1
      : 1;

    console.log({ orderNumber });

    const createdOrder = await this.prisma.$transaction(
      async (prisma) => {
        if (!branchLastOrderNumber) {
          await prisma.branchLastOrderNumber.create({
            data: { tenantId, branchId, lastOrderNumber: orderNumber },
          });
        } else {
          await prisma.branchLastOrderNumber.update({
            where: { id: branchLastOrderNumber.id },
            data: { lastOrderNumber: orderNumber },
          });
        }

        const createdOrder = await prisma.order.create({
          data: {
            tableId: table.id,
            userDevice: '',
            tenantId,
            branchId,
            type,
            quantity: totalQuantity,
            orderNumber,
            subTotal: new Decimal(roundedSubTotal),
            tax: new Decimal(roundedTax),
            total: new Decimal(roundedTotal),
            orderItems: { createMany: { data: orderItemsData } },
            status: 'in_kitchen',
          },
          include: {
            table: true,
            orderItems: {
              include: { menuItem: { include: { prices: true } } },
            },
          },
        });

        return createdOrder;
      },
      {
        timeout: 10000,
        maxWait: 10000,
      },
    );

    // Notify client
    this.wsGateway.server
      .to([branchId])
      .emit('newOrder', { order: createdOrder });
  }

  // READ: Fetch all orders with pagination (can customize pagination later)
  async getOrdersByTable({
    branchId,
    date,
    paid = false,
  }: {
    branchId: string;
    date?: string;
    paid?: boolean;
  }) {
    // Fetch all orders for the branch
    const allOrders = await this.prisma.order.findMany({
      where: {
        branchId,
        paid,
        ...(date && {
          createdAt: {
            gte: new Date(date),
            lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
          },
        }),
      },
      include: {
        table: true,
        orderItems: {
          include: {
            menuItem: {
              include: {
                prices: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group orders by tableId
    const groupedOrders = allOrders.reduce<Record<string, Order[]>>(
      (acc, order) => {
        const tableId = order.tableId;
        if (tableId) {
          if (!acc[tableId]) {
            acc[tableId] = [];
          }
          acc[tableId].push(order);
        }

        return acc;
      },
      {},
    );

    // Separate latest orders and current orders based on the count of orders per table
    const latestOrders = Object.values(groupedOrders)
      .filter((orders) => orders.length > 1) // Only include tables with more than 1 order
      .map((orders) => orders[0]); // Take the most recent order for those tables

    return { latestOrders, currentOrders: allOrders };
  }

  async getActiveTableOrdersOverview(tableId: string) {
    if (!tableId) {
      throw new Error('Table ID is required');
    }

    // Fetch active (unpaid) orders for the given table
    const unpaidOrders = await this.prisma.order.findMany({
      where: {
        tableId,
        paid: false, // Only unpaid orders
        deletedAt: null, // Exclude soft-deleted orders
        status: {
          not: 'completed',
        },
      },
      select: {
        id: true,
        total: true,
        orderItems: {
          select: {
            quantity: true,
          },
        },
      },
    });

    // Calculate total and quantity
    const totalAmount = unpaidOrders
      .reduce((sum, order) => sum + parseFloat(order.total.toString()), 0)
      .toFixed(2);

    const totalQuantity = unpaidOrders.reduce(
      (sum, order) =>
        sum +
        order.orderItems.reduce((qtySum, item) => qtySum + item.quantity, 0),
      0,
    );

    return {
      total: Number(totalAmount),
      quantity: totalQuantity,
      hasUnpaidOrders: unpaidOrders.length > 0,
    };
  }

  async findAll({
    branchId,
    date,
    paid = false,
    status,
    orderBy = 'desc',
  }: {
    branchId: string;
    date?: string;
    paid?: boolean;
    status?: order_status[];
    orderBy?: 'asc' | 'desc';
  }) {
    console.log({ status });
    // Fetch all orders for the branch
    const allOrders = await this.prisma.order.findMany({
      where: {
        branchId,
        paid,
        ...(date && {
          createdAt: {
            gte: new Date(date),
            lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
          },
        }),
        // status
        ...(status &&
          status.length > 0 && {
            status: { in: status },
          }),
      },
      include: {
        table: true,
        orderItems: {
          include: {
            price: true,
            menuItem: {
              include: {
                prices: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: orderBy,
      },
    });

    return allOrders;
  }

  async filterOrders({
    date,
    page = 1,
    pageSize = 10,
    orderNumber,
    tableIds,
    paid,
  }: {
    date: string | { startDate: string; endDate: string };
    page: number;
    pageSize?: number;
    orderNumber?: number;
    tableIds?: string | string[];
    paid?: boolean;
  }) {
    console.log({
      date,
      page,
      pageSize,
      orderNumber,
      tableIds,
    });
    const skip = (page - 1) * pageSize;

    // Build dynamic where clause
    const whereClause: any = {};

    if (isBoolean(paid)) {
      whereClause.paid = paid;
    }
    // Handle single date or date range
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date format');
      }
      whereClause.createdAt = {
        gte: new Date(parsedDate.setHours(0, 0, 0, 0)),
        lt: new Date(parsedDate.setHours(24, 0, 0, 0)),
      };
    } else if (typeof date === 'object' && date.startDate && date.endDate) {
      const startDate = new Date(date.startDate);
      const endDate = new Date(date.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date range');
      }

      whereClause.createdAt = {
        gte: new Date(startDate.setHours(0, 0, 0, 0)),
        lt: new Date(endDate.setHours(24, 0, 0, 0)),
      };
    }

    // Filter by order number
    if (orderNumber && !isNaN(orderNumber)) {
      whereClause.orderNumber = orderNumber;
    }

    // Filter by table IDs
    if (tableIds) {
      const tableIdArray = Array.isArray(tableIds)
        ? tableIds
        : tableIds.split(',');
      whereClause.tableId = { in: tableIdArray };
    }

    // Fetch paginated orders with filters
    const [allOrders, totalCount] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where: whereClause,
        include: {
          table: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      this.prisma.order.count({
        where: whereClause,
      }),
    ]);

    return {
      data: allOrders,
      total: totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }

  async getOrdersByIds(orderIds: string[]) {
    // Fetch all orders for the branch
    const allOrders = await this.prisma.order.findMany({
      where: {
        id: { in: orderIds },
      },
      include: {
        table: true,
        orderItems: {
          include: {
            menuItem: {
              include: {
                prices: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return allOrders;
  }

  async getActiveTableOrders(tableId: string, status: string) {
    // Fetch active orders with the given status
    console.log({
      tableId,
      status,
    });
    return this.prisma.order.findMany({
      where: {
        tableId,
        paid: false,
        status: {
          in: [status as order_status],
        },
      },
      include: {
        table: true,
        orderItems: {
          include: {
            menuItem: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getTableBillWithQuantity(tableId: string) {
    // Aggregate subTotal, tax, total, and item quantity at the DB level
    const [orderSummary, orderItemsSummary] = await this.prisma.$transaction([
      this.prisma.order.aggregate({
        where: {
          tableId,
          deletedAt: null,
          paid: false,
        },
        _sum: {
          subTotal: true,
          tax: true,
          total: true,
        },
      }),
      this.prisma.orderItem.aggregate({
        where: {
          order: {
            tableId,
            deletedAt: null,
            paid: false,
          },
        },
        _sum: {
          quantity: true,
        },
      }),
    ]);

    return {
      subTotal: Number((orderSummary._sum.subTotal || 0).toFixed(2)),
      tax: Number((orderSummary._sum.tax || 0).toFixed(2)),
      total: Number((orderSummary._sum.total || 0).toFixed(2)),
      totalQuantity: orderItemsSummary._sum.quantity || 0,
    };
  }

  async getActiveTableOrdersItemsQuantity(tableId: string) {
    const quantity = await this.prisma.orderItem.aggregate({
      _sum: { quantity: true },
      where: {
        order: {
          tableId,
        },
      },
    });

    return quantity;
  }

  // READ: Fetch a single order by ID
  async findOne(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        table: true,
        orderItems: {
          include: {
            price: true,
            menuItem: {
              include: {
                prices: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  async hasUnpaidOrders({
    orderIds,
    tableId,
  }: {
    orderIds: string[];
    tableId: string;
  }): Promise<boolean> {
    console.log({ orderIds, tableId });
    const unpaidOrder = await this.prisma.order.findFirst({
      where: {
        tableId,
        id: { in: orderIds },
        paid: false, // Checking for at least one unpaid order
        deletedAt: null, // Ensuring soft-deleted orders are excluded
      },
      select: { id: true }, // Selecting only the ID to optimize performance
    });

    console.log({ unpaidOrder, has: !!unpaidOrder });

    return !!unpaidOrder; // Returns true if at least one unpaid order exists
  }

  // UPDATE: Update an order's details (excluding the orderItems)
  async update(orderId: string, updateOrderDto: UpdateOrderDto) {
    const { status, paid } = updateOrderDto;

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        ...updateOrderDto,
      },
      include: {
        orderItems: true,
      },
    });

    return order;
  }

  async updatePaidStatus(tableId: string, paid: boolean) {
    const orderIds = await this.prisma.order.findMany({
      where: { tableId, paid: false },
      select: {
        id: true,
      },
    });
    return this.prisma.order.updateMany({
      where: {
        tableId,
        id: {
          in: orderIds.map((orderIdsObj) => orderIdsObj.id),
        },
      },
      data: {
        paid,
      },
    });
  }

  async updateOrderStatus(orderId: string, newStatus: order_status) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { tableId: true, createdAt: true, status: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Update the order status
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: { table: true },
    });

    // If the new status is 'completed', find the next order and mark it as 'cooking'
    if (newStatus === 'completed' && order.tableId) {
      const nextOrder = await this.prisma.order.findFirst({
        where: {
          tableId: order.tableId,
          status: 'in_kitchen', // Adjust if needed
          createdAt: { gt: order.createdAt },
        },
        orderBy: { createdAt: 'asc' },
      });

      if (nextOrder) {
        await this.prisma.order.update({
          where: { id: nextOrder.id },
          data: { status: 'cooking' },
        });
      }
    }

    // Notify client
    this.wsGateway.server
      .to([updatedOrder.branchId])
      .emit('orderStatusUpdated', { order: updatedOrder });

    return { success: true, message: 'Order status updated' };
  }

  // DELETE: Delete an order by ID
  async remove(orderId: string) {
    const order = await this.prisma.order.delete({
      where: { id: orderId },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return { message: 'Order deleted successfully' };
  }

  calculateUserDistanceFromRestaurant(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const R = 6371000; // Radius of Earth in meters
    const toRad = (value: number) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
}
