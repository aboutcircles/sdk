import { Sdk } from '@aboutcircles/sdk';
import { circlesConfig } from '@aboutcircles/sdk-core';
import { generatePrivateKey } from 'viem/accounts';

/**
 * Referrals SDK Integration Example
 *
 * This example shows how to use referrals through the main Sdk class
 * rather than the standalone Referrals client.
 *
 * The Sdk provides a unified interface for all Circles operations.
 */

// Configure with referrals service URL
const config = {
  ...circlesConfig[100], // Gnosis Chain
  referralsServiceUrl: 'https://staging.circlesubi.network/referrals',
};

// Initialize SDK (read-only, no contract runner)
const sdk = new Sdk(config);

// Example 1: Store a referral via SDK
async function exampleSdkStoreReferral() {
  console.log('=== SDK: Store Referral ===\n');

  const privateKey = generatePrivateKey();
  const inviterAddress = '0x1234567890123456789012345678901234567890';

  console.log('Generated private key:', privateKey.slice(0, 10) + '...');

  try {
    await sdk.referrals.store(privateKey, inviterAddress);
    console.log('✓ Referral stored via SDK');
    return privateKey;
  } catch (error) {
    console.error('✗ Store failed:', error);
    throw error;
  }
}

// Example 2: Retrieve referral via SDK
async function exampleSdkRetrieveReferral(privateKey: string) {
  console.log('\n=== SDK: Retrieve Referral ===\n');

  try {
    const info = await sdk.referrals.retrieve(privateKey);

    console.log('✓ Referral info:');
    console.log('  - Inviter:', info.inviter);
    console.log('  - Status:', info.status);

    return info;
  } catch (error) {
    console.error('✗ Retrieve failed:', error);
    throw error;
  }
}

// Example 3: Full invitation flow
async function exampleFullInvitationFlow() {
  console.log('=== Full Invitation Flow ===\n');

  // This demonstrates the complete flow an app would implement:
  //
  // INVITER SIDE:
  // 1. Generate a referral private key
  // 2. Store it in the backend (validates on-chain)
  // 3. Share the private key with invitee (e.g., as URL param)
  //
  // INVITEE SIDE:
  // 4. Receive the private key from invite link
  // 5. Retrieve referral info to see who invited them
  // 6. Use sdk.register.asHuman() which checks for pending invitations

  console.log('Inviter creates referral:');
  const referralKey = generatePrivateKey();
  console.log('- Generated key:', referralKey.slice(0, 20) + '...');

  // In a real app, the inviter would be the logged-in user's address
  const inviterAddress = '0xInviterSafeAddress' as `0x${string}`;

  console.log('\nInviter stores referral in backend...');
  console.log('(Skipping - requires real on-chain account)\n');
  // await sdk.referrals.store(referralKey, inviterAddress);

  console.log('Invitee receives link and looks up referral...');
  console.log('(Skipping - no stored referral)\n');
  // const info = await sdk.referrals.retrieve(referralKey);
  // console.log('Invited by:', info.inviter);

  console.log('Invitee registers using the inviter address...');
  console.log('(Skipping - requires contract runner)\n');
  // const avatar = await sdk.register.asHuman(info.inviter, { name: 'NewUser' });
}

// Example 4: Error handling when service not configured
function exampleMissingConfig() {
  console.log('=== Error Handling: Missing Config ===\n');

  // SDK without referrals URL
  const sdkNoReferrals = new Sdk(circlesConfig[100]);

  try {
    // This will throw because referralsServiceUrl is not set
    sdkNoReferrals.referrals.retrieve('0x...');
  } catch (error: any) {
    console.log('✓ Expected error:', error.message);
    console.log('\nTo fix: Include referralsServiceUrl in your config');
  }
}

// Run examples
async function runExamples() {
  console.log('Referrals SDK Integration Examples\n');
  console.log('Backend:', config.referralsServiceUrl);
  console.log('─'.repeat(50) + '\n');

  // Show error handling for missing config
  exampleMissingConfig();

  console.log('\n');

  // Show the conceptual flow
  await exampleFullInvitationFlow();

  console.log('=== Examples Complete ===');
}

runExamples();

export { exampleSdkStoreReferral, exampleSdkRetrieveReferral, exampleFullInvitationFlow };
