import { CirclesRpc } from '@aboutcircles/sdk-rpc';

/**
 * Avatar Examples
 *
 * This example demonstrates:
 * - Getting avatar information
 * - Getting network snapshots
 */

const rpc = new CirclesRpc('https://rpc.aboutcircles.com/');

// Example 1: Get avatar info
async function exampleGetAvatarInfo() {
  console.log('=== Example 1: Get Avatar Information ===\n');

  const address = '0xA6247834B41771022498F63CAE8820fFEE208265';

  const avatarInfo = await rpc.avatar.getAvatarInfo(address);

  console.log('Address:', address);
  console.log('\nAvatar information:', avatarInfo);

  if (avatarInfo) {
    console.log('\nAvatar details:');
    console.log('- Type:', avatarInfo.type || 'Unknown');
    console.log('- Version:', avatarInfo.version || 'Unknown');
    if (avatarInfo.tokenAddress) {
      console.log('- Token Address:', avatarInfo.tokenAddress);
    }
    if (avatarInfo.cidV0) {
      console.log('- CID V0:', avatarInfo.cidV0);
    }
  }
}

// Example 2: Get network snapshot
async function exampleGetNetworkSnapshot() {
  console.log('\n\n=== Example 2: Get Network Snapshot ===\n');

  const snapshot = await rpc.avatar.getNetworkSnapshot();

  console.log('Network snapshot retrieved successfully');
  console.log('\nSnapshot summary:');
  console.log('- Trust relations:', snapshot.trustRelations?.length || 0);
  console.log('- Balances:', snapshot.balances?.length || 0);
  console.log('- Block number:', snapshot.blockNumber || 'N/A');
  console.log('- Timestamp:', snapshot.timestamp || 'N/A');

  if (snapshot.timestamp) {
    const date = new Date(Number(snapshot.timestamp) * 1000);
    console.log('- Date:', date.toISOString());
  }

  // Show sample of trust relations
  if (snapshot.trustRelations && snapshot.trustRelations.length > 0) {
    console.log('\nSample trust relations (first 5):');
    snapshot.trustRelations.slice(0, 5).forEach((relation: any, index: number) => {
      console.log(`${index + 1}. ${relation.truster || relation.from} → ${relation.trustee || relation.to}`);
    });
  }

  // Show sample of balances
  if (snapshot.balances && snapshot.balances.length > 0) {
    console.log('\nSample balances (first 5):');
    snapshot.balances.slice(0, 5).forEach((balance: any, index: number) => {
      console.log(`${index + 1}. ${balance.account}: ${balance.balance}`);
    });
  }
}

// Run examples
async function runExamples() {
  try {
    await exampleGetAvatarInfo();
    await exampleGetNetworkSnapshot();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Uncomment to run:
// runExamples();
