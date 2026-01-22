import type { Abi } from 'abitype';
import { encodeFunctionData, decodeFunctionResult } from '@aboutcircles/sdk-utils/abi';
import type { Address, Hex } from '@aboutcircles/sdk-types';

/**
 * Generic Contract class for type-safe contract interactions
 */
export class Contract<TAbi extends readonly unknown[] = Abi> {
  public readonly address: Address;
  public readonly abi: TAbi;
  protected rpcUrl: string;

  constructor(config: {
    address: Address;
    abi: TAbi;
    rpcUrl: string;
  }) {
    this.address = config.address;
    this.abi = config.abi;
    this.rpcUrl = config.rpcUrl;
  }
  // @todo add encode read
  /**
   * Read from contract (view/pure functions) using direct JSON-RPC call
   * @param functionName - The contract function to call
   * @param args - Function arguments
   * @param options - Optional call options
   */
  async read(
    functionName: string,
    args?: readonly unknown[],
    options?: { from?: Address }
  ): Promise<unknown> {
    // Encode the function call
    const data = encodeFunctionData({
      abi: this.abi as Abi,
      functionName,
      args,
    } as Parameters<typeof encodeFunctionData>[0]);

    // Build the call params
    const callParams = {
      to: this.address,
      data,
      ...(options?.from && { from: options.from }), // Include 'from' field if provided
    };

    // Make direct JSON-RPC call to avoid bundling createPublicClient from viem
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [callParams, 'latest'],
      }),
    });

    const json = await response.json() as { error?: { message: string }; result?: Hex };

    if (json.error) {
      throw new Error(`RPC Error: ${json.error.message}`);
    }

    if (!json.result) {
      throw new Error('No result returned from RPC call');
    }

    // Decode the result
    return decodeFunctionResult({
      abi: this.abi as Abi,
      functionName,
      data: json.result,
    } as Parameters<typeof decodeFunctionResult>[0]);
  }

  /**
   * Encode transaction data for write functions
   */
  encodeWrite(functionName: string, args?: readonly unknown[]): Hex {
    return encodeFunctionData({
      abi: this.abi as Abi,
      functionName,
      args,
    } as Parameters<typeof encodeFunctionData>[0]);
  }
}
