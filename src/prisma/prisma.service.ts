import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core/router';
import { PrismaClient } from '@prisma/client';

const rootScopeModels = ['Tenant'];
const branchScopeModels = [
  'MenuCategory',
  'Order',
  'User',
  'AddonGroup',
  'Badge',
  'Table',
];
const tenantScopeModels = ['Branch', ...branchScopeModels];
@Injectable({
  scope: Scope.REQUEST,
})
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private tenantId: string | null = null;
  private branchId: string | null = null;
  constructor(
    @Inject(REQUEST) private readonly request: Record<string, unknown>,
  ) {
    super();
    // Express headers are stored as lowercase keys
    const headers = request.headers as Record<string, string>;

    this.tenantId = headers['x-tenant-id'] || null;
    this.branchId = headers['x-branch-id'] || null;
    this.$use(async (params, next) => {
      const newParams = { ...params };

      if (
        ['findMany', 'findUnique', 'findFirst', 'count', 'aggregate'].includes(
          params.action,
        )
      ) {
        newParams.args.where = {
          deletedAt: null,
          ...newParams.args.where,
        };

        const model = params.model || '';
        if (rootScopeModels.includes(model)) {
          newParams.args.where = {
            ...newParams.args.where,
          };
        }

        if (tenantScopeModels.includes(model)) {
          newParams.args.where = {
            ...newParams.args.where,
            tenantId: this.tenantId,
          };
        }

        if (branchScopeModels.includes(model)) {
          newParams.args.where = {
            ...newParams.args.where,
            branchId: this.branchId,
          };
        }
      }
      // Soft delete handling
      if (newParams.action === 'delete') {
        newParams.action = 'update'; // Change action to update
        newParams.args.data = { deletedAt: new Date() };
      } else if (newParams.action === 'deleteMany') {
        newParams.action = 'updateMany'; // Change action to updateMany
        newParams.args.data = { deletedAt: new Date() };
      }

      console.log({ where: newParams.args.where });

      return next(newParams);
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
