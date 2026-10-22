import { CirclesRpc } from '@aboutcircles/sdk-rpc';

/**
 * Basic RPC Configuration Examples
 *
 * This example demonstrates how to initialize and configure the CirclesRpc client.
 */

console.log('=== Basic RPC Configuration ===\n');

// Example 1: Create RPC instance with default endpoint
console.log('Example 1: Default RPC Endpoint\n');

const rpc = new CirclesRpc('https://rpc.aboutcircles.com/');
console.log('Using RPC:', rpc.getRpcUrl());

// Example 2: Use alternative RPC endpoint
console.log('\n\nExample 2: Alternative RPC Endpoint\n');

const rpcAlternative = new CirclesRpc('https://rpc.aboutcircles.com/');
console.log('Alternative RPC:', rpcAlternative.getRpcUrl());

// Example 3: Change RPC URL dynamically
console.log('\n\nExample 3: Change RPC URL Dynamically\n');

console.log('Original RPC:', rpc.getRpcUrl());
rpc.setRpcUrl('https://rpc.aboutcircles.com/');
console.log('Updated RPC:', rpc.getRpcUrl());

// Example 4: Access RPC methods
console.log('\n\nExample 4: Available RPC Method Groups\n');

console.log('The CirclesRpc client provides access to:');
console.log('- rpc.circlesV2: CirclesV2 operations (balance, pathfinding)');
console.log('- rpc.query: Query operations (tables, events, custom queries)');
console.log('- rpc.trust: Trust relationship operations');
console.log('- rpc.balance: Balance operations');
console.log('- rpc.avatar: Avatar information operations');
console.log('- rpc.profile: Profile operations');

export { rpc };
