import { Module } from '@nestjs/common';
import { MenuCategoryController } from './category.controller';
import { MenuCategoryService } from './category.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
  imports: [],
  controllers: [MenuCategoryController],
  providers: [MenuCategoryService, AuthGuard],
})
export class CategoryModule {}
