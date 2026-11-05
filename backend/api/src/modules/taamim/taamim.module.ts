import { Module } from '@nestjs/common';
import { TaamimController } from './taamim.controller';
import { TaamimService } from './taamim.service';

@Module({
  controllers: [TaamimController],
  providers: [TaamimService],
  exports: [TaamimService],
})
export class TaamimModule {}
