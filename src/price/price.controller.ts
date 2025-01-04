import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { PriceService } from './price.service';
import {
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

/**
 * Response object for the swap rate.
 *
 * @remarks
 * The response object contains the swap rate and the fee in ETH and USD.
 */
export class SwapRateResponse {
  @ApiProperty({ description: 'The amount of BTC' })
  btcAmount: number;

  @ApiProperty({ description: 'The fee in ETH' })
  feeInEth: number;

  @ApiProperty({ description: 'The fee in USD' })
  feeInDollar: number;
}

@ApiTags('Price')
@Controller('price')
/**
 * Controller for handling price-related requests.
 *
 * @remarks
 * Handles requests related to prices of assets on various blockchain
 * networks.
 */
export class PriceController {
  constructor(private priceService: PriceService) {}

  @Get('hourly')
  @ApiOperation({ summary: 'Get hourly prices for a specific chain' })
  @ApiQuery({
    name: 'chainSymbol',
    required: true,
    description: 'Symbol of the blockchain chain (e.g., ETH, BTC)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns hourly prices for the given chain symbol',
    isArray: true, // Indicates the response is an array of objects
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          hour: { type: 'string', description: 'The hour of the price' },
          averagePrice: {
            type: 'number',
            description: 'The average price during that hour',
          },
          minPrice: {
            type: 'number',
            description: 'The minimum price during that hour',
          },
          maxPrice: {
            type: 'number',
            description: 'The maximum price during that hour',
          },
        },
      },
    },
  })
  /**
   * Retrieves the hourly prices for the specified blockchain chain symbol.
   *
   * @param chainSymbol The symbol of the blockchain chain (e.g., ETH, BTC).
   * @returns An array of objects containing the hour, average price, minimum price,
   *          and maximum price for each hour within the last 24 hours.
   */
  async getHourlyPrices(@Query('chainSymbol') chainSymbol: string) {
    return await this.priceService.getHourlyPrices(chainSymbol);
  }

  @Post('alert')
  @ApiOperation({ summary: 'Set an alert for price threshold' })
  @ApiBody({
    description:
      'Alert details including chain symbol, target price, and email',
    type: Object,
    examples: {
      example1: {
        value: {
          chainSymbol: 'ETH',
          targetPrice: 3000,
          email: 'user@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Price alert has been set successfully',
    schema: {
      example: {
        message: 'success',
      },
    },
  })
  /**
   * Sets an alert for when the price of the specified blockchain chain symbol
   * reaches the target price. When the price threshold is reached, an email
   * notification will be sent to the user.
   *
   * @param chainSymbol The symbol of the blockchain chain (e.g., ETH, BTC).
   * @param targetPrice The price threshold for the alert.
   * @param email The email address to send the notification to.
   * @returns A string indicating the success of the operation.
   */
  async setAlert(
    @Body('chainSymbol') chainSymbol: string,
    @Body('targetPrice') targetPrice: number,
    @Body('email') email: string,
  ) {
    await this.priceService.setAlert(chainSymbol, targetPrice, email);
    return 'success';
  }

  @Get('swap-eth-to-btc')
  @ApiOperation({ summary: 'Get the swap rate for ETH to BTC' })
  @ApiQuery({
    name: 'ethAmount',
    required: true,
    description: 'Amount of ETH to swap',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the swap rate details for ETH to BTC',
    type: SwapRateResponse,
    schema: {
      example: {
        btcAmount: 0.05,
        feeInEth: 0.002,
        feeInDollar: 10.5,
      },
    },
  })
  /**
   * Gets the swap rate details for ETH to BTC.
   *
   * @param ethAmount The amount of ETH to swap.
   * @returns The swap rate details, including the amount of BTC received, the
   * fee in ETH, and the fee in USD.
   */
  async getSwapRate(@Query('ethAmount') ethAmount: number): Promise<{
    btcAmount: number;
    feeInEth: number;
    feeInDollar: number;
  }> {
    const swapDetails = await this.priceService.calculateSwapRate(ethAmount);
    return swapDetails;
  }
}
