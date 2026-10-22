import { CirclesRpc } from '@aboutcircles/sdk-rpc';

/**
 * Profile Examples
 *
 * This example demonstrates:
 * - Getting profiles by CID
 * - Getting profiles by address
 * - Batch profile retrieval
 * - Searching profiles
 */

const rpc = new CirclesRpc('https://rpc.aboutcircles.com/');

// Example 1: Get profile by CID
async function exampleGetProfileByCid() {
  console.log('=== Example 1: Get Profile by CID ===\n');

  const cid = 'Qmb2s3hjxXXcFqWvDDSPCd1fXXa9gcFJd8bzdZNNAvkq9W';

  const profile = await rpc.profile.getProfileByCid(cid);

  console.log('CID:', cid);
  console.log('Profile:', profile);

  if (profile) {
    console.log('\nProfile details:');
    console.log('- Name:', profile.name || 'N/A');
    console.log('- Description:', profile.description || 'N/A');
    if (profile.imageUrl) {
      console.log('- Image URL:', profile.imageUrl);
    }
  }
}

// Example 2: Get profiles by CID batch
async function exampleGetProfileByCidBatch() {
  console.log('\n\n=== Example 2: Get Profiles by CID (Batch) ===\n');

  const cids = [
    'Qmb2s3hjxXXcFqWvDDSPCd1fXXa9gcFJd8bzdZNNAvkq9W',
    null,
    'QmZuR1Jkhs9RLXVY28eTTRSnqbxLTBSoggp18Yde858xCM',
    'QmanRNbDjbiSFdxcYT9S9wpk3gaCVnM81MVAHkmJj6AqE5'
  ];

  const profiles = await rpc.profile.getProfileByCidBatch(cids);

  console.log('Requested CIDs:', cids.length);
  console.log('Profiles retrieved:', profiles);

  profiles.forEach((profile: any, index: number) => {
    console.log(`\n${index + 1}. CID: ${cids[index] || 'null'}`);
    if (profile) {
      console.log(`   Name: ${profile.name || 'N/A'}`);
    } else {
      console.log('   Profile: Not found');
    }
  });
}

// Example 3: Get profile by address
async function exampleGetProfileByAddress() {
  console.log('\n\n=== Example 3: Get Profile by Address ===\n');

  const address = '0xc3a1428c04c426cdf513c6fc8e09f55ddaf50cd7';

  const profile = await rpc.profile.getProfileByAddress(address);

  console.log('Address:', address);
  console.log('Profile:', profile);

  if (profile) {
    console.log('\nProfile details:');
    console.log('- Name:', profile.name || 'N/A');
    console.log('- Description:', profile.description || 'N/A');
    if (profile.imageUrl) {
      console.log('- Image URL:', profile.imageUrl);
    }
    if (profile.previewImageUrl) {
      console.log('- Preview Image URL:', profile.previewImageUrl);
    }
  }
}

// Example 4: Get profiles by address batch
async function exampleGetProfileByAddressBatch() {
  console.log('\n\n=== Example 4: Get Profiles by Address (Batch) ===\n');

  const addresses = [
    '0xc3a1428c04c426cdf513c6fc8e09f55ddaf50cd7',
    '0xf712d3b31de494b5c0ea51a6a407460ca66b12e8',
    null,
    '0xde374ece6fa50e781e81aac78e811b33D16912C7'
  ];

  const profiles = await rpc.profile.getProfileByAddressBatch(addresses);

  console.log('Requested addresses:', addresses.length);
  console.log('Profiles retrieved:', profiles.length);

  profiles.forEach((profile: any, index: number) => {
    console.log(`\n${index + 1}. Address: ${addresses[index] || 'null'}`);
    if (profile) {
      console.log(`   Name: ${profile.name || 'N/A'}`);
    } else {
      console.log('   Profile: Not found');
    }
  });
}

// Example 5: Search profiles
async function exampleSearchProfiles() {
  console.log('\n\n=== Example 5: Search Profiles ===\n');

  const searchAddress = '0xc3a1428c04c426cdf513c6fc8e09f55ddaf50cd7';
  const limit = 10;
  const offset = 0;

  const results = await rpc.profile.searchProfiles(searchAddress, limit, offset);

  console.log('Search address:', searchAddress);
  console.log('Limit:', limit);
  console.log('Offset:', offset);
  console.log('\nSearch results:', results);

  if (results && Array.isArray(results)) {
    console.log('\nTotal results:', results.length);
    results.slice(0, 5).forEach((result: any, index: number) => {
      console.log(`\n${index + 1}. ${result.name || 'Unknown'}`);
      console.log(`   Address: ${result.address || 'N/A'}`);
    });
  }
}

// Run examples
async function runExamples() {
  try {
    await exampleGetProfileByCid();
    await exampleGetProfileByCidBatch();
    await exampleGetProfileByAddress();
    await exampleGetProfileByAddressBatch();
    await exampleSearchProfiles();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Uncomment to run:
// runExamples();
