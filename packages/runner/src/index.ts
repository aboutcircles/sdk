/**
 * @aboutcircles/sdk-runner
 *
 * Contract runner implementations for executing blockchain operations.
 * Provides Safe multisig wallet integration for transaction execution.
 */

export type { ContractRunner, BatchRun } from './runner';

// Safe Multisig Runner (server-side with private key)
export { SafeContractRunner, SafeBatchRun } from './safe-runner';

// Safe Browser Runner (client-side with Web3 wallet)
export { SafeBrowserRunner, SafeBrowserBatchRun } from './safe-browser-runner';

// Miniapp postMessage runner (iframe client-side)
export {
  MiniAppPostMessageRunner,
  MiniAppBatchRun,
  type MiniAppPostMessageRunnerOptions,
  type MiniAppSignatureType,
  type MiniAppSignResult,
} from './miniapp-postmessage-runner';

// Error handling
export { RunnerError } from './errors';
export type { RunnerErrorSource } from './errors';
