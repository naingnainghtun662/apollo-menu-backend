import { Module } from '@nestjs/common';
import { MenuItemController } from './menu-item.controller';
import { MenuItemService } from './menu-item.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
  imports: [],
  controllers: [MenuItemController],
  providers: [MenuItemService, AuthGuard],
})
export class MenuItemModule {}
