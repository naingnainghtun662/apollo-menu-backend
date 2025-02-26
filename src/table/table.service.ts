import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RemoveTableDto } from './dto/remove-table.dto';
import * as QRCode from 'qrcode';
@Injectable()
export class TableService {
  private readonly logger = new Logger(TableService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.table.findMany({
      orderBy: [{ createdAt: 'asc' }, { name: 'asc' }],
    });
  }

  async getTablesForFilter() {
    return this.prisma.table.findMany({
      select: { id: true, name: true },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const table = await this.prisma.table.findUnique({ where: { id } });
    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }
    return table;
  }

  async create(
    createTableDto: CreateTableDto,
    tenantId: string,
    branchId: string,
  ) {
    const { tables } = createTableDto;

    // Check if any of the tables already exist
    const existingTables = await this.prisma.table.findMany({
      where: {
        tenantId,
        branchId,
        name: {
          in: tables.map((table) => table.name), // Check for multiple names
        },
      },
    });

    const existingTableNames = existingTables.map((table) => table.name);

    // If any table already exists, throw an error
    if (existingTableNames.length > 0) {
      throw new ConflictException(
        `Tables with the following names already exist: ${existingTableNames.join(', ')}.`,
      );
    }

    const createdTables = await this.prisma.table.createManyAndReturn({
      data: tables.map(({ name }) => ({
        name,
        qrCode: '',
        tenantId,
        branchId,
      })),
    });

    const qrUpdates = [];

    for (const [index, table] of tables.entries()) {
      try {
        // Define the content of the QR code
        const content = `${process.env.FRONTEND_URL}/${tenantId}/${branchId}/menus/?table=${table.name}&tid=${createdTables[index].id}`;

        // Generate QR code as a Data URL
        const qrDataUrl = await QRCode.toDataURL(content, { width: 300 });

        // Update the QR code in the database
        qrUpdates.push(
          this.prisma.table.update({
            where: { id: createdTables[index].id },
            data: { qrCode: qrDataUrl },
          }),
        );
      } catch (error) {
        console.error(
          `Failed to generate QR code for table "${table.name}":`,
          error,
        );
      }
    }

    // Wait for all QR code updates to complete
    await Promise.all(qrUpdates);

    return createdTables; // Return the created tables with updated QR codes
  }

  async update(
    tenantId: string,
    branchId: string,
    id: string,
    updateTableDto: UpdateTableDto,
  ) {
    this.logger.log({
      updateTableDto,
      tenantId,
      branchId,
    });
    const existingTable = await this.prisma.table.findFirst({
      where: {
        tenantId,
        branchId,
        name: updateTableDto.name,
      },
    });
    if (existingTable) {
      throw new ConflictException(
        `Table with the following name already exist: ${existingTable.name}.`,
      );
    }
    const table = await this.prisma.table.update({
      where: { id },
      data: updateTableDto,
    });
    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }
    return table;
  }

  async remove({ tables }: RemoveTableDto) {
    // Check if there are any unpaid orders for the provided tables
    const unpaidOrders = await this.prisma.order.count({
      where: {
        tableId: {
          in: tables,
        },
        paid: false, // Only check for unpaid orders
      },
    });

    // If there are unpaid orders, throw an error
    if (unpaidOrders > 0) {
      throw new Error('Cannot delete tables with unpaid orders.');
    }

    // Proceed with deletion of tables if no unpaid orders exist
    const { count } = await this.prisma.table.deleteMany({
      where: {
        id: {
          in: tables,
        },
      },
    });

    return count;
  }
}
