import { CirclesRpc } from '@aboutcircles/sdk-rpc';
// @todo update the naming `getTotalBalance` is moved to a different place
/**
 * CirclesV2 Balance and Pathfinding Examples
 *
 * This example demonstrates:
 * - Getting total v2 Circles balance
 * - Finding paths between addresses
 * - Circular paths (token swaps)
 */

const rpc = new CirclesRpc('https://rpc.aboutcircles.com/');

// Example 2: Find a path between two addresses
async function exampleFindPath() {
  console.log('\n\n=== Example 2: Find Transfer Path ===\n');

  const path = await rpc.circlesV2.findPath({
    from: '0x749c930256b47049cb65adcd7c25e72d5de44b3b',
    to: '0xde374ece6fa50e781e81aac78e811b33d16912c7',
    targetFlow: 99999999999999999999999999999999999n
  });

  console.log('From: 0x749c930256b47049cb65adcd7c25e72d5de44b3b');
  console.log('To: 0xde374ece6fa50e781e81aac78e811b33d16912c7');
  console.log('Path found:', path);

  if (path) {
    console.log('\nPath details:');
    console.log('- Transfers required:', path.transfers?.length || 0);
    console.log('- Maximum flow:', path.maxFlow);
  }
}

// Example 3: Find a circular path (token swap)
async function exampleCircularPath() {
  console.log('\n\n=== Example 3: Circular Path (Token Swap) ===\n');

  const path = await rpc.circlesV2.findPath({
    from: '0xde374ece6fa50e781e81aac78e811b33d16912c7',
    to: '0xde374ece6fa50e781e81aac78e811b33d16912c7', // same address (circular)
    targetFlow: 100000000000000000000n,
    fromTokens: ['0x86533d1aDA8Ffbe7b6F7244F9A1b707f7f3e239b'],
    toTokens: ['0x6B69683C8897e3d18e74B1Ba117b49f80423Da5d'],
    simulatedBalances: [{
      holder: '0xde374ece6fa50e781e81aac78e811b33d16912c7',
      token: '0x86533d1aDA8Ffbe7b6F7244F9A1b707f7f3e239b',
      amount: 100000000000000000000n,
      isWrapped: false
    }]
  });

  console.log('Circular path (token swap):');
  console.log('From token: 0x86533d1aDA8Ffbe7b6F7244F9A1b707f7f3e239b');
  console.log('To token: 0x6B69683C8897e3d18e74B1Ba117b49f80423Da5d');
  console.log('Target flow: 100 Circles');
  console.log('\nPath found:', path);

  if (path) {
    console.log('\nSwap details:');
    console.log('- Transfers required:', path.transfers?.length || 0);
    console.log('- Actual flow:', path.maxFlow);
  }
}

// Run examples
async function runExamples() {
  try {
    await exampleGetTotalBalance();
    //await exampleFindPath();
    //await exampleCircularPath();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Uncomment to run:
runExamples();
