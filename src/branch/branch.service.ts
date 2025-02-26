import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust this based on your Prisma service path
import { Branch } from '@prisma/client'; // Import Branch type from Prisma
import { CreateBranchDto } from './dto/create-branch.dto';

@Injectable()
export class BranchService {
  constructor(private prisma: PrismaService) {}

  // Create a new branch
  async createBranch(data: CreateBranchDto, tenantId: string): Promise<Branch> {
    const { lat, long, radius, ...other } = data;
    const branch = await this.prisma.branch.create({
      data: {
        ...other,
        tenantId,
      },
    });

    return branch;
  }

  // Get all branches
  async getAllBranches(tenantId: string): Promise<Branch[]> {
    return this.prisma.branch.findMany({
      where: {
        tenantId,
      },
    });
  }

  // Get a branch by id
  async getBranchById(id: string): Promise<Branch | null> {
    return this.prisma.branch.findUnique({
      where: { id },
    });
  }

  // Update a branch by id
  async updateBranch(id: string, data: Partial<Branch>): Promise<Branch> {
    return this.prisma.branch.update({
      where: { id },
      data,
    });
  }

  // Delete a branch by id
  async deleteBranch(id: string): Promise<Branch> {
    return this.prisma.branch.delete({
      where: { id },
    });
  }
}
