import { Controller, Get, Param } from '@nestjs/common';
import { TaamimService } from './taamim.service';

@Controller('taamim')
export class TaamimController {
  constructor(private readonly taamimService: TaamimService) {}

  @Get()
  async getAllTaamim() {
    return this.taamimService.getAllTaamim();
  }

  @Get(':id')
  async getTaamById(@Param('id') id: string) {
    return this.taamimService.getTaamById(id);
  }
}
