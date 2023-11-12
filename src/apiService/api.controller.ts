import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { Order } from '../types/order';
import { AuthGuard } from '../auth/auth.guard';
import { ApiService } from './api.service';

@Controller('info')
@UseGuards(AuthGuard)
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get()
  async getApiInfo(@Query() order: Order) {
    if (order.orderType) {
      return this.apiService.getOrdersByType(order.orderType).catch((err) => {
        throw new HttpException(err, HttpStatus.NOT_FOUND);
      });
    }
  }
}
