import { cidV0ToHex } from '@aboutcircles/sdk-utils';
import type { Hex } from '@aboutcircles/sdk-types';

export function cidV0ToDigest32Strict(cid: string): Hex {
  return cidV0ToHex(cid);
}

export function tryCidV0ToDigest32(cid: unknown): Hex | undefined {
  if (typeof cid !== 'string') return undefined;
  if (!/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(cid.trim())) return undefined;
  try {
    return cidV0ToHex(cid.trim());
  } catch {
    return undefined;
  }
}
