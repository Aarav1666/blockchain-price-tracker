// email.module.ts
import { Module } from '@nestjs/common';
import { DexEmailService } from './dex-email.service';

@Module({
  providers: [DexEmailService],
  exports: [DexEmailService],
})
/**
 * Module providing email sending functionality.
 *
 * @module
 */
export class DexEmailModule {}
