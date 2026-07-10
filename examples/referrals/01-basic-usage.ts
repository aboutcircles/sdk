import { Referrals } from '@aboutcircles/sdk-referrals';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

/**
 * Referrals Basic Usage Example
 *
 * This example demonstrates the referral/invitation workflow:
 * 1. Inviter creates a referral link (generates private key)
 * 2. Inviter stores the referral in the backend
 * 3. Invitee retrieves referral info using the private key
 * 4. Inviter can list all their referrals
 *
 * Backend: https://staging.circlesubi.network/referrals
 */

const REFERRALS_URL = 'https://staging.circlesubi.network/referrals';

// Initialize the Referrals client (no auth needed for store/retrieve)
const referrals = new Referrals(REFERRALS_URL);

// Example inviter address (replace with actual address in production)
const INVITER_ADDRESS = '0x1234567890123456789012345678901234567890';

// Example 1: Generate a referral link
function exampleGenerateReferral() {
  console.log('=== Example 1: Generate Referral Link ===\n');

  // Generate a new private key for the referral
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  console.log('Generated referral:');
  console.log('- Private Key:', privateKey);
  console.log('- Account Address:', account.address);
  console.log('\nShare this private key with your invitee.');
  console.log('They will use it to claim their invitation.\n');

  return privateKey;
}

// Example 2: Store a referral in the backend
async function exampleStoreReferral(privateKey: string, inviter: string) {
  console.log('=== Example 2: Store Referral ===\n');

  console.log('Storing referral:');
  console.log('- Private Key:', privateKey.slice(0, 10) + '...');
  console.log('- Inviter:', inviter);

  try {
    await referrals.store(privateKey, inviter);
    console.log('\n✓ Referral stored successfully!');
    console.log('The backend validated the private key on-chain.');
  } catch (error) {
    console.error('\n✗ Failed to store referral:', error);
    throw error;
  }
}

// Example 3: Retrieve referral info (what invitee would do)
async function exampleRetrieveReferral(privateKey: string) {
  console.log('\n\n=== Example 3: Retrieve Referral (Invitee Flow) ===\n');

  console.log('Looking up referral with private key...');

  try {
    const info = await referrals.retrieve(privateKey);

    console.log('\n✓ Referral found!');
    console.log('- Inviter:', info.inviter);
    console.log('- Status:', info.status);
    if (info.accountAddress) {
      console.log('- Account Address:', info.accountAddress);
    }

    return info;
  } catch (error) {
    console.error('\n✗ Failed to retrieve referral:', error);
    throw error;
  }
}

// Example 4: List all referrals (requires authentication)
async function exampleListMyReferrals() {
  console.log('\n\n=== Example 4: List My Referrals (Authenticated) ===\n');

  // For authenticated endpoints, you need a token provider
  const AUTH_URL = 'https://staging.circlesubi.network/auth';

  // In production, implement proper JWT token fetching
  const getAuthToken = async (): Promise<string> => {
    // This would typically:
    // 1. Sign a message with the user's wallet
    // 2. Exchange the signature for a JWT at the auth endpoint
    // Example:
    // const response = await fetch(`${AUTH_URL}/login`, { ... });
    // return response.json().token;
    throw new Error('Implement auth token fetching for your app');
  };

  const authenticatedClient = new Referrals(REFERRALS_URL, getAuthToken);

  try {
    const result = await authenticatedClient.listMine();

    console.log(`✓ Found ${result.count} referrals:\n`);

    for (const referral of result.referrals) {
      console.log(`Referral ${referral.id}:`);
      console.log(`  - Status: ${referral.status}`);
      console.log(`  - Created: ${referral.createdAt}`);
      if (referral.accountAddress) {
        console.log(`  - Account: ${referral.accountAddress}`);
      }
      if (referral.confirmedAt) {
        console.log(`  - Confirmed: ${referral.confirmedAt}`);
      }
      if (referral.claimedAt) {
        console.log(`  - Claimed: ${referral.claimedAt}`);
      }
      console.log();
    }

    return result;
  } catch (error) {
    console.error('\n✗ Failed to list referrals:', error);
    console.log('(This is expected if auth is not configured)');
  }
}

// Run examples
async function runExamples() {
  try {
    // Step 1: Generate a referral (inviter side)
    const privateKey = exampleGenerateReferral();

    // Step 2: Store the referral in backend
    // Note: This will fail with a mock address - use a real registered avatar
    console.log('Skipping store example (requires real on-chain account)\n');
    // await exampleStoreReferral(privateKey, INVITER_ADDRESS);

    // Step 3: Retrieve referral info (invitee side)
    // Note: This will fail without a stored referral
    console.log('Skipping retrieve example (no stored referral)\n');
    // await exampleRetrieveReferral(privateKey);

    // Step 4: List my referrals (requires auth)
    // await exampleListMyReferrals();

    console.log('=== Examples Complete ===');
    console.log('\nTo run the full flow:');
    console.log('1. Use a real inviter address with an on-chain account');
    console.log('2. Configure authentication for listMine()');
  } catch (error) {
    console.error('\nError running examples:', error);
  }
}

runExamples();

export { exampleGenerateReferral, exampleStoreReferral, exampleRetrieveReferral, exampleListMyReferrals };
