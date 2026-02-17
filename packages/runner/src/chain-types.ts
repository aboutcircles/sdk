import type { Chain } from 'viem';

/**
 * Flexible chain configuration interface.
 * Accepts both full viem Chain objects and minimal chain configs.
 * This allows the runner to work without requiring the exact viem Chain branded type.
 */
export interface ChainConfig {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: {
    default: {
      http: readonly string[];
    };
  };
}

/**
 * Type that accepts either a full viem Chain or our minimal ChainConfig.
 * This provides flexibility while maintaining type safety.
 */
export type ChainLike = Chain | ChainConfig;

/**
 * Validates that a ChainLike object has the required fields for viem's createPublicClient.
 * Throws an error if required fields are missing, making failures explicit.
 *
 * @param chain - The chain configuration to validate
 * @returns The chain cast to viem's expected type
 * @throws Error if required fields are missing
 */
export function asViemChain(chain: ChainLike): Chain {
  // Validate required fields exist at runtime
  if (typeof chain.id !== 'number') {
    throw new Error('Chain config missing required field: id');
  }
  if (typeof chain.name !== 'string') {
    throw new Error('Chain config missing required field: name');
  }
  if (!chain.nativeCurrency || typeof chain.nativeCurrency.decimals !== 'number') {
    throw new Error('Chain config missing required field: nativeCurrency');
  }
  if (!chain.rpcUrls?.default?.http?.length) {
    throw new Error('Chain config missing required field: rpcUrls.default.http');
  }

  // Cast is safe after validation - ChainConfig satisfies viem's runtime requirements
  return chain as Chain;
}

/**
 * Pre-configured chain configs for common networks.
 * Use these instead of importing from viem/chains to avoid type mismatches.
 */
export const chains = {
  gnosis: {
    id: 100,
    name: 'Gnosis',
    nativeCurrency: {
      name: 'xDAI',
      symbol: 'xDAI',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://rpc.gnosischain.com'] as const,
      },
    },
  } satisfies ChainConfig,

  chiado: {
    id: 10200,
    name: 'Chiado',
    nativeCurrency: {
      name: 'xDAI',
      symbol: 'xDAI',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://rpc.chiadochain.net'] as const,
      },
    },
  } satisfies ChainConfig,

  /** Alias for chiado - common testnet naming convention */
  get gnosisChiado() {
    return this.chiado;
  },
} as const;
