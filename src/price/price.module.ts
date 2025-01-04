import { Module } from '@nestjs/common';
import { PriceService } from './price.service';
import { PriceController } from './price.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env', // Specifies the path to the .env file
    }),
  ],
  providers: [PriceService, PrismaService],
  controllers: [PriceController],
})
/**
 * Price Module
 *
 * @description
 * This module provides the price service and controller to handle price related
 * operations.
 *
 * @module PriceModule
 * @exports PriceModule
 */
export class PriceModule {}
