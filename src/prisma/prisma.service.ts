import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
/**
 * Service for interacting with the Prisma database client.
 *
 * This service provides access to the Prisma database client, and handles
 * connecting and disconnecting from the database as part of the NestJS
 * application lifecycle.
 *
 * @remarks
 * The service is registered as a singleton, so it can be imported and used
 * throughout the application.
 */
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Called by the NestJS framework when the module is initialized.
   *
   * This method establishes a connection to the Prisma database.
   * It is automatically invoked as part of the application's lifecycle
   * during the module initialization phase.
   *
   * @async
   * @function onModuleInit
   * @memberof PrismaService
   */

  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Called by the NestJS framework when the module is destroyed.
   *
   * This method closes the connection to the Prisma database.
   * It is automatically invoked as part of the application's lifecycle
   * during the module destruction phase.
   *
   * @async
   * @function onModuleDestroy
   * @memberof PrismaService
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
