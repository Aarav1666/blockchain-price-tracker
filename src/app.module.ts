import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PriceModule } from './price/price.module';
import { DexMoralisModule } from './dex-moralis/dex-moralis.module';
import { PrismaService } from './prisma/prisma.service';
import { ScheduleModule } from '@nestjs/schedule';
import { DexEmailModule } from './dex-email/dex-email.module';
import { DexCronModule } from './dex-cron/dex-cron.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available globally
      envFilePath: '.env', // Specifies the path to the .env file
    }),
    PriceModule,
    DexMoralisModule,
    ScheduleModule.forRoot(),
    DexEmailModule,
    DexCronModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
/*************  ✨ Codeium Command 🌟  *************/
/**
 * The root module of the application.
 *
 * This module is responsible for setting up the application.
 *
 * @remarks
 * The module is responsible for importing all other modules, setting up the
 * configuration, and providing the AppController and AppService.
 *
 * @see {@link https://docs.nestjs.com/modules}
 */
export class AppModule implements OnModuleInit {
  constructor(private configService: ConfigService) {}
  async onModuleInit() {
    await DexMoralisModule.register(this.configService);
  }
}
