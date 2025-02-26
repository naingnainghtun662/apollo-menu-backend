import { Module } from '@nestjs/common';
import { AddonController } from './addon.controller';
import { AddonService } from './addon.service';

@Module({
  imports: [],
  controllers: [AddonController],
  providers: [AddonService],
})
export class AddonModule {}
