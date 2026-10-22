import { CirclesRpc } from '@aboutcircles/sdk-rpc';

/**
 * Trust Examples
 *
 * This example demonstrates how to work with trust relationships in the Circles network.
 */

const rpc = new CirclesRpc('https://rpc.aboutcircles.com/');

// Example: Get common trust between two addresses
async function exampleGetCommonTrust() {
  console.log('=== Example: Get Common Trust ===\n');

  const address1 = '0xde374ece6fa50e781e81aac78e811b33d16912c7';
  const address2 = '0xe8fc7a2d0573e5164597b05f14fa9a7fca7b215c';

  const commonTrust = await rpc.trust.getCommonTrust(address1, address2);

  console.log('Address 1:', address1);
  console.log('Address 2:', address2);
  console.log('\nCommon trust connections:', commonTrust);

  if (commonTrust && commonTrust.length > 0) {
    console.log('\nThese addresses have', commonTrust.length, 'common trust connections');
    console.log('\nCommon connections:');
    commonTrust.slice(0, 10).forEach((connection: any, index: number) => {
      console.log(`${index + 1}. ${connection}`);
    });
  } else {
    console.log('\nNo common trust connections found');
  }
}

// Run examples
async function runExamples() {
  try {
    await exampleGetCommonTrust();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Uncomment to run:
// runExamples();
