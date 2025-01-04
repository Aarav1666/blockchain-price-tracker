import {
  EvmChain,
  EvmErc20TokenBalanceWithPriceResult,
} from '@moralisweb3/common-evm-utils';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import Moralis from 'moralis';
import { DexEmailService } from 'src/dex-email/dex-email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MORALIS_CHAIN_VARIABLES } from 'src/utilities/constants/chain.constant';

@Injectable()
/**
 * Service for handling scheduled tasks related to blockchain price tracking.
 *
 * @class DexCronService
 */
export class DexCronService {
  /**
   * The constructor for the DexCronService class.
   *
   * @param prisma The PrismaService instance for database operations.
   * @param emailService The DexEmailService instance for sending email notifications.
   */
  constructor(
    private prisma: PrismaService,
    private emailService: DexEmailService,
  ) {}

  /**
   * Gets the current price for a given address on a specific chain.
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

  @Cron('0 */5 * * * *')
  /**
   * Scheduled task to save current prices for Ethereum and Polygon to the database.
   * Also check for price changes in the last hour and notify users if a threshold
   * has been reached. Additionally, check for price changes compared to the saved
   * price in the user's alert threshold.
   *
   * @async
   * @function savePrices
   * @memberof DexCronService
   * @instance
   */
  async savePrices() {
    console.log('cron @savePrices()');
    const [ethPrice, polygonPrice] = await Promise.all([
      this.getPrice(
        MORALIS_CHAIN_VARIABLES.Ethereum.address,
        MORALIS_CHAIN_VARIABLES.Ethereum.chain,
      ),
      this.getPrice(
        MORALIS_CHAIN_VARIABLES.Polygon.address,
        MORALIS_CHAIN_VARIABLES.Polygon.chain,
      ),
    ]);

    await this.prisma.price.createMany({
      data: [
        {
          name: ethPrice?.result?.[0]?.name,
          symbol: ethPrice?.result?.[0]?.symbol,
          usd_price: Number(ethPrice?.result?.[0]?.usdPrice),
          usd_price_24hr_percent_change: Number(
            ethPrice?.result?.[0]?.usdPrice24hrPercentChange,
          ),
          usd_price_24hr_usd_change: Number(
            ethPrice?.result?.[0]?.usdPrice24hrUsdChange,
          ),
          usd_value_24hr_usd_change: Number(
            ethPrice?.result?.[0]?.usdValue24hrUsdChange,
          ),
        },
        {
          name: polygonPrice?.result?.[0]?.name,
          symbol: polygonPrice?.result?.[0]?.symbol,
          usd_price: Number(polygonPrice?.result?.[0]?.usdPrice),
          usd_price_24hr_percent_change: Number(
            polygonPrice?.result?.[0]?.usdPrice24hrPercentChange,
          ),
          usd_price_24hr_usd_change: Number(
            polygonPrice?.result?.[0]?.usdPrice24hrUsdChange,
          ),
          usd_value_24hr_usd_change: Number(
            polygonPrice?.result?.[0]?.usdValue24hrUsdChange,
          ),
        },
      ],
    });

    console.log(
      'cron @savePrices():: Price Alert Time Threshold - 1hour from now',
    );
    this.hourlyPercentageAnalysis(
      MORALIS_CHAIN_VARIABLES.Ethereum.symbol,
      Number(ethPrice?.result?.[0]?.usdPrice),
    );
    this.hourlyPercentageAnalysis(
      MORALIS_CHAIN_VARIABLES.Polygon.symbol,
      Number(polygonPrice?.result?.[0]?.usdPrice),
    );

    console.log('cron @savePrices():: Price Alert User set Threshold');
    this.triggerUserAlert(
      MORALIS_CHAIN_VARIABLES.Ethereum.symbol,
      Number(ethPrice?.result?.[0]?.usdPrice),
    );
    this.triggerUserAlert(
      MORALIS_CHAIN_VARIABLES.Polygon.symbol,
      Number(polygonPrice?.result?.[0]?.usdPrice),
    );
  }

  /**
   * Sends an email notification to the user when the price of a chain has
   * increased by more than 3% since the last cron job run.
   *
   * @param chain The chain that triggered the alert.
   * @param oldPrice The price of the chain in the last cron job run.
   * @param newPrice The current price of the chain.
   */
  private async sendEmailNotificationChangeThreshold3Percent(
    chain: string,
    oldPrice: number,
    newPrice: number,
  ): Promise<void> {
    const mailOptions = {
      to: 'hyperhire_assignment@hyperhire.in',
      subject: `Price Alert: ${chain} price increased by more than 3%`,
      text: `The price of ${chain} has increased by more than 3%. Old price: $${oldPrice}, New price: $${newPrice}.`,
    };

    try {
      await this.emailService.sendEmail(mailOptions);
    } catch (error) {
      console.log(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Checks if the price of a chain has increased by more than 3% since the last hour.
   * If so, sends an email notification to the user.
   *
   * @param chainSymbol The symbol of the chain to check.
   * @param currentPrice The current price of the chain.
   */
  private async hourlyPercentageAnalysis(
    chainSymbol: string,
    currentPrice: number,
  ) {
    const hourlyRecordSpan = 12;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour in milliseconds

    const latestRecord = await this.prisma.price.findFirst({
      where: {
        timestamp: {
          lte: oneHourAgo, // Less than or equal to 1 hour ago
        },
        symbol: chainSymbol,
      },
      orderBy: {
        timestamp: 'desc', // Sort by date in descending order to get the latest
      },
    });

    const changePercentage =
      ((currentPrice - latestRecord.usd_price) / currentPrice) * 100;

    if (changePercentage > 3) {
      await this.sendEmailNotificationChangeThreshold3Percent(
        latestRecord.name,
        latestRecord.usd_price,
        currentPrice,
      );
    }
  }

  /**
   * Sends an email notification to the user when the price of a chain has exceeded
   * the user's set limit.
   *
   * @param chain The symbol of the chain that triggered the alert.
   * @param userEmail The email address of the user to send the notification to.
   * @param userPriceLimit The price limit set by the user that was exceeded.
   * @param currentPrice The current price of the chain that exceeded the user's limit.
   */
  private async sendEmailNotificationForPriceLimit(
    chain: string,
    userEmail: string,
    userPriceLimit: number,
    currentPrice: number,
  ): Promise<void> {
    const mailOptions = {
      to: userEmail,
      subject: `Price Alert: ${chain} price exceeded $${userPriceLimit}`,
      text: `The price of ${chain} has exceeded your set limit of $${userPriceLimit}. Current price: $${currentPrice}.`,
    };

    try {
      await this.emailService.sendEmail(mailOptions);
      console.log(`Price alert email sent to ${userEmail} for ${chain}`);
    } catch (error) {
      console.log(`Failed to send email to ${userEmail}: ${error.message}`);
    }
  }

  /**
   * Sends an email notification to the user when the price of a chain has exceeded
   * the user's set limit.
   *
   * @param chainSymbol The symbol of the chain that triggered the alert.
   * @param targetPrice The price of the chain that exceeded the user's limit.
   * @returns An array of records that triggered the alert.
   */
  private async triggerUserAlert(chainSymbol: string, targetPrice: number) {
    try {
      const records = await this.prisma.userAlert.findMany({
        where: {
          price: {
            lt: targetPrice, // Less than the target price
          },
          chain: chainSymbol,
        },
      });

      records?.forEach((record) =>
        this.sendEmailNotificationForPriceLimit(
          record.chain,
          record.email,
          record.price,
          targetPrice,
        ),
      );

      return records;
    } catch (error) {
      console.error('Error fetching records:', error);
      throw error;
    }
  }
}
