import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './category/category.module';
import { MenuItemModule } from './menu-item/menu-item.module';
import { BadgeModule } from './badge/badge.module';
import { TenantModule } from './tenant/tenant.module';
import { UserModule } from './user/user.module';
import { AddonModule } from './addon/addon.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseModule } from './supabase/supabase.module';
import { BranchModule } from './branch/branch.module';
import { TableModule } from './table/table.module';
import { OrderModule } from './order/order.module';
import { EventsModule } from './events/events.module';
import { APP_GUARD } from '@nestjs/core';
import { TenantBranchGuard } from './guards/tenant-branch.guard';
import { RoleModule } from './role/role.module';
import { RolesGuard } from './auth/role.guard';
import { AuthGuard } from './auth/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TenantModule,
    UserModule,
    CategoryModule,
    MenuItemModule,
    BadgeModule,
    AddonModule,
    PrismaModule,
    SupabaseModule,
    BranchModule,
    TableModule,
    OrderModule,
    EventsModule,
    RoleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: TenantBranchGuard,
    },
  ],
})
export class AppModule {}
