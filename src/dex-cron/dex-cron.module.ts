import { Module } from '@nestjs/common';
import { DexCronService } from './dex-cron.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DexEmailService } from 'src/dex-email/dex-email.service';

@Module({
  providers: [DexCronService, PrismaService, DexEmailService],
})
/**
 * DexCronModule is a NestJS module that provides cron job functionality.
 * It includes services for handling database operations and sending emails.
 */
export class DexCronModule {}
