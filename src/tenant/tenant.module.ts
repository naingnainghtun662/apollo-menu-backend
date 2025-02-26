import { Module } from '@nestjs/common';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { UserModule } from 'src/user/user.module';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
  imports: [UserModule],
  controllers: [TenantController],
  providers: [TenantService, AuthGuard],
})
export class TenantModule {}
