import { Module } from '@nestjs/common';
import { TableController } from './table.controller';
import { TableService } from './table.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
  imports: [],
  controllers: [TableController],
  providers: [TableService, AuthGuard],
})
export class TableModule {}
