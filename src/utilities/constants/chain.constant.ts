import { EvmChain } from '@moralisweb3/common-evm-utils';

/**
 * Object containing the Moralis chain variables.
 *
 * @remarks
 * This object is used to interact with the Moralis API.
 */
export const MORALIS_CHAIN_VARIABLES = {
  Ethereum: {
    chain: EvmChain.ETHEREUM,
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    symbol: 'ETH',
  },
  Polygon: {
    chain: EvmChain.POLYGON,
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'POL',
  },
};
