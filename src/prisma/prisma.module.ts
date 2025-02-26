import { Global, Module, Scope } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    {
      provide: PrismaService,
      useClass: PrismaService,
      scope: Scope.REQUEST, // Make it request-scoped
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
