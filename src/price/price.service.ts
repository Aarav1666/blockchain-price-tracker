import { PrismaService } from 'src/prisma/prisma.service';
import Moralis from 'moralis';
import {
  EvmChain,
  EvmErc20TokenBalanceWithPriceResult,
} from '@moralisweb3/common-evm-utils';
import { MORALIS_CHAIN_VARIABLES } from 'src/utilities/constants/chain.constant';
import { Injectable } from '@nestjs/common';
import { groupByHour } from 'src/utilities/helpers/groupByHour.helper';

@Injectable()
/*************  ✨ Codeium Command 🌟  *************/
/**
 * Service that provides methods for retrieving token balances and prices.
 *
 * @example
 *
 **/
export class PriceService {
  private readonly feePercentage = 0.03; // 3% fee

  constructor(private prisma: PrismaService) {}

  /**
   * Retrieves the current price for a given address on a specific chain.
   *
   * @param address The address to check the price for.
   * @param chain The chain the address is on.
   * @returns The current price for the given address on the given chain.
   */
  async getPrice(
    address: string,
    chain: EvmChain,
  ): Promise<EvmErc20TokenBalanceWithPriceResult> {
    const response = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
      address,
      chain,
      limit: 1,
    });
    return response.response;
  }

  /**
   * Retrieves the hourly prices for the specified blockchain chain symbol.
   *
   * @param chainSymbol The symbol of the blockchain chain (e.g., ETH, BTC).
   * @returns An array of objects containing the hour, average price, minimum price,
   *          and maximum price for each hour within the last 24 hours.
   */
  async getHourlyPrices(chainSymbol: string) {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

      // Fetch records from the last 24 hours
      const records = await this.prisma.price.findMany({
        where: {
          symbol: chainSymbol,
          timestamp: {
            gte: oneDayAgo, // Greater than or equal to 24 hours ago
            lte: now, // Less than or equal to now
          },
        },
        orderBy: {
          timestamp: 'asc', // Sort by date in ascending order
        },
      });

      // Group records by hour
      const groupedByHour = groupByHour(records, 'usd_price');

      return groupedByHour;
    } catch (error) {
      console.error('Error fetching hourly prices:', error);
      throw error;
    }
  }

  /**
   * Sets an alert for a specified blockchain chain symbol and target price.
   * Stores the alert details, including the user's email address, in the database.
   *
   * @param chainSymbol The symbol of the blockchain chain (e.g., ETH, BTC).
   * @param targetPrice The price threshold for the alert.
   * @param email The email address to associate with the alert.
   *
   * @throws Will throw an error if unable to create the alert in the database.
   */

  async setAlert(chainSymbol: string, targetPrice: number, email: string) {
    try {
      await this.prisma.userAlert.create({
        data: { chain: chainSymbol, price: targetPrice, email },
      });
    } catch (error) {
      console.error('Error creating user alert:', {
        chain: chainSymbol,
        price: targetPrice,
        email,
      });
      throw error;
    }
  }

  /**
   * Calculates the swap rate for ETH to BTC based on the current ETH to BTC exchange rate,
   * the current Ethereum price in USD, and the fee percentage.
   *
   * @param ethAmount The amount of ETH to swap.
   * @returns An object containing the amount of BTC received, the fee in ETH, and the fee in USD.
   *
   * @throws Will throw an error if the Ethereum amount is invalid (i.e., less than or equal to 0).
   */
  async calculateSwapRate(ethAmount: number): Promise<{
    btcAmount: number;
    feeInEth: number;
    feeInDollar: number;
  }> {
    if (!ethAmount || ethAmount <= 0) {
      throw new Error('Invalid Ethereum amount');
    }

    // Fetch the current ETH to BTC exchange rate
    const ethToBtcRate = await this.getEthToBtcRate();

    // Fetch the current Ethereum price in USD
    const ethPriceInUsd = await this.getEthPriceInUsd();

    // Calculate the total fee
    const feeInEth = ethAmount * this.feePercentage;
    const feeInDollar = feeInEth * ethPriceInUsd;

    // Calculate BTC amount after deducting the fee
    const btcAmount = (ethAmount - feeInEth) * ethToBtcRate;

    return {
      btcAmount,
      feeInEth,
      feeInDollar,
    };
  }

  /**
   * Fetches the current Ethereum (ETH) to Bitcoin (BTC) exchange rate from
   * CoinGecko API. The exchange rate is used to calculate the swap rate for
   * ETH to BTC.
   *
   * @returns The current ETH to BTC exchange rate.
   *
   * @throws Will throw an error if unable to fetch the exchange rate from the
   * CoinGecko API.
   */
  private async getEthToBtcRate(): Promise<number> {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin&vs_currencies=btc',
    );

    if (!response.ok) {
      throw new Error('Failed to fetch ETH to BTC rate');
    }
    const data = await response.json();

    return data.ethereum.btc;
  }

  /**
   * Fetches the current Ethereum (ETH) price in USD from Moralis API.
   *
   * @returns The current Ethereum price in USD.
   *
   * @throws Will throw an error if unable to fetch the Ethereum price from the
   * Moralis API.
   */
  private async getEthPriceInUsd(): Promise<number> {
    const [ethPrice] = await Promise.all([
      this.getPrice(
        MORALIS_CHAIN_VARIABLES.Ethereum.address,
        MORALIS_CHAIN_VARIABLES.Ethereum.chain,
      ),
    ]);
    return Number(ethPrice?.result?.[0]?.usdPrice ?? '0'); // Ethereum price in USD
  }
}
