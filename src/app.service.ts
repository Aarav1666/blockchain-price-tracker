import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
/**
 * Service class for the Block Tracker application.
 *
 * @class AppService
 */
export class AppService {
  constructor(private configService: ConfigService) {}

  /**
   * Returns a greeting message for the Block Tracker application.
   *
   * @returns A promise that resolves to the greeting message string.
   */

  async getHello(): Promise<string> {
    return 'Block Tracker App';
  }
}
