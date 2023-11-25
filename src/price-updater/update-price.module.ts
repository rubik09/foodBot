import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UpdatePriceProvider } from './update-price.provider';
import { Price, PriceSchema } from 'src/schemas/price.schema';
import { UpdatePriceController } from './update-price.controller';
import { UpdatePriceService } from './update-price.service';

@Module({
  exports: [UpdatePriceService, UpdatePriceProvider],
  imports: [MongooseModule.forFeature([{ name: Price.name, schema: PriceSchema }])],
  providers: [UpdatePriceService, UpdatePriceProvider],
  controllers: [UpdatePriceController],
})
export class UpdatePriceModule {}
