import { CirclesRpc } from '@aboutcircles/sdk-rpc';

/**
 * Query Examples
 *
 * This example demonstrates:
 * - Querying tables
 * - Querying events
 * - Custom queries with filters
 * - Sorting and filtering results
 */

const rpc = new CirclesRpc('https://rpc.aboutcircles.com/');

// Example 1: Get available tables
async function exampleGetTables() {
  console.log('=== Example 1: Get Available Tables ===\n');

  const tables = await rpc.query.tables();
  console.log('Available tables:', tables);
  console.log('\nTotal tables:', tables.length);
}

// Example 2: Query trust relations
async function exampleQueryTrustRelations() {
  console.log('\n\n=== Example 2: Query Trust Relations ===\n');

  const trustRelations = await rpc.query.query({
    Namespace: 'V_CrcV2',
    Table: 'TrustRelations',
    Columns: [],
    Filter: [{
      Type: 'Conjunction',
      ConjunctionType: 'Or',
      Predicates: [
        {
          Type: 'FilterPredicate',
          FilterType: 'Equals',
          Column: 'truster',
          Value: '0xc7d3dF890952a327Af94D5Ba6fdC1Bf145188a1b'
        },
        {
          Type: 'FilterPredicate',
          FilterType: 'Equals',
          Column: 'trustee',
          Value: '0xA6247834B41771022498F63CAE8820fFEE208265'
        }
      ]
    }],
    Order: []
  });

  console.log('Trust relations found:', trustRelations);
  console.log('Total results:', trustRelations.length);
}

// Example 3: Query events
async function exampleQueryEvents() {
  console.log('\n\n=== Example 3: Query Events ===\n');

  const events = await rpc.query.events(
    38000000, // from block
    null, // to block (null = latest)
    ['CrcV1_Trust'], // event types
    null, // filter
    false // include logs
  );

  console.log('Trust events from block 38000000:');
  console.log('Total events:', events.length);
  if (events.length > 0) {
    console.log('\nFirst event:', events[0]);
  }
}

// Example 4: Query token information
async function exampleQueryTokenInfo() {
  console.log('\n\n=== Example 4: Query Token Information ===\n');

  const tokenInfo = await rpc.query.query({
    Namespace: 'V_Crc',
    Table: 'Tokens',
    Columns: [
      'blockNumber',
      'timestamp',
      'transactionIndex',
      'logIndex',
      'transactionHash',
      'version',
      'type',
      'token',
      'tokenOwner'
    ],
    Filter: [{
      Type: 'FilterPredicate',
      FilterType: 'Equals',
      Column: 'token',
      Value: '0x0d8c4901dd270fe101b8014a5dbecc4e4432eb1e'
    }],
    Order: []
  });

  console.log('Token: 0x0d8c4901dd270fe101b8014a5dbecc4e4432eb1e');
  console.log('Token information:', tokenInfo);
}

// Example 5: Query token holders with sorting
async function exampleQueryTokenHolders() {
  console.log('\n\n=== Example 5: Query Token Holders (Sorted) ===\n');

  const holders = await rpc.query.query({
    Namespace: 'V_CrcV2',
    Table: 'BalancesByAccountAndToken',
    Columns: [],
    Filter: [{
      Type: 'FilterPredicate',
      FilterType: 'Equals',
      Column: 'tokenAddress',
      Value: '0x42cedde51198d1773590311e2a340dc06b24cb37'
    }],
    Order: [{
      Column: 'demurragedTotalBalance',
      SortOrder: 'DESC'
    }]
  });

  console.log('Token: 0x42cedde51198d1773590311e2a340dc06b24cb37');
  console.log('Holders (sorted by balance):', holders.length);

  if (holders.length > 0) {
    console.log('\nTop holders:');
    holders.slice(0, 5).forEach((holder: any, index: number) => {
      console.log(`${index + 1}. ${holder.account}: ${holder.demurragedTotalBalance}`);
    });
  }
}

// Run examples
async function runExamples() {
  try {
    await exampleGetTables();
    await exampleQueryTrustRelations();
    await exampleQueryEvents();
    await exampleQueryTokenInfo();
    await exampleQueryTokenHolders();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Uncomment to run:
// runExamples();
