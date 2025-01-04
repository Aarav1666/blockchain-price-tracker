import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
/**
 * PrismaModule is responsible for providing and exporting the PrismaService.
 *
 * This module ensures that the PrismaService is available for dependency injection
 * throughout the application, allowing for database operations using Prisma.
 */
export class PrismaModule {}
