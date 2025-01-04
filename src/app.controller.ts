import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
/**
 * The main controller for the application.
 *
 * @remarks
 * This controller is the entry point for the application. It provides a single
 * endpoint that returns the init message.
 *
 * @example
 * curl http://localhost:3000
 */
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get the init message' })
  @ApiResponse({
    status: 200,
    description: 'Returns the init message',
    type: String,
  })
  /*************  ✨ Codeium Command ⭐  *************/
  /**
   * Returns the init message for the application.
   *
   * @returns A promise that resolves with the init message.
   */
  /******  21fd65a3-b53d-46cf-a70a-8eecb7f3e985  *******/
  async getHello(): Promise<string> {
    return await this.appService.getHello();
  }
}
