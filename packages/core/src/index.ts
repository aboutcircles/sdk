export * from './core.js';
export * from './contracts/index.js';
export type { CirclesConfig } from '@aboutcircles/sdk-types';
export { circlesConfig } from './config.js';

// Error handling
export { ContractError, NetworkError } from './errors.js';
export type { CoreErrorSource } from './errors.js';
