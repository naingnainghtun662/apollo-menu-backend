import { Module } from '@nestjs/common';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
  imports: [],
  controllers: [BranchController],
  providers: [BranchService, AuthGuard],
})
export class BranchModule {}
