import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Moralis from 'moralis';

@Module({})
/**
 * A module that provides the Moralis SDK to other parts of the application.
 *
 * This module is responsible for registering the Moralis SDK with the API key
 * from the configuration.
 */
export class DexMoralisModule {
  /**
   * Registers the Moralis SDK with the API key from the configuration.
   * This function is a static method and should be called before any other
   * code that uses the Moralis SDK.
   * @param configService The configuration service, used to retrieve the API key.
   * @returns A promise that resolves when the Moralis SDK is initialized.
   */
  static async register(configService: ConfigService): Promise<void> {
    await Moralis.start({
      apiKey: configService.get<string>('MORALIS_KEY'),
    });

    console.log('Moralis SDK initialized globally');
  }
}
