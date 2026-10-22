import { CirclesRpc } from '@aboutcircles/sdk-rpc';

/**
 * Balance Examples
 *
 * This example demonstrates how to query token balances for an address.
 */

const rpc = new CirclesRpc('https://rpc.aboutcircles.com/');

// Example: Get token balances for an address (V2 tokens only)
async function exampleGetTokenBalances() {
  console.log('=== Example: Get Token Balances (V2 Only) ===\n');

  const address = '0xc7d3dF890952a327Af94D5Ba6fdC1Bf145188a1b';

  const allBalances = await rpc.balance.getTokenBalances(address);

  // Filter to only show V2 tokens
  const v2Balances = allBalances.filter(balance => balance.version === 2);

  console.log('Address:', address);
  console.log('\nTotal tokens held (all versions):', allBalances.length);
  console.log('V2 tokens held:', v2Balances.length);

  if (v2Balances.length > 0) {
    console.log('\nTop 10 V2 token balances:');
    v2Balances.slice(0, 10).forEach((balance, index) => {
      console.log(`\n${index + 1}. Token Address: ${balance.tokenAddress}`);
      console.log(`   Token Owner: ${balance.tokenOwner}`);
      console.log(`   Token Type: ${balance.tokenType}`);
      console.log(`   Atto Circles (bigint): ${balance.attoCircles}`);
      console.log(`   Circles (number): ${balance.circles}`);
      console.log(`   Static Atto Circles (bigint): ${balance.staticAttoCircles}`);
      console.log(`   Static Circles (number): ${balance.staticCircles}`);
      console.log(`   Token Flags: ERC1155=${balance.isErc1155}, Wrapped=${balance.isWrapped}, Group=${balance.isGroup}`);
    });
  } else {
    console.log('\nNo V2 tokens found for this address');
  }

  return v2Balances;
}

// Run examples
async function runExamples() {
  try {
    await exampleGetTokenBalances();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

runExamples();
