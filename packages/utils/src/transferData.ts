import { CID } from 'multiformats/cid';
import { base16 } from 'multiformats/bases/base16';
import { base58btc } from 'multiformats/bases/base58';
import { keccak_256 } from '@noble/hashes/sha3.js';
import type { Hex, DecodedTransferData, TransferDataType } from '@aboutcircles/sdk-types';
import { encodeFunctionData } from './abi.js';
import { decodeAbiParameters } from './abi.js';
import { hexToBytes, bytesToHex } from './bytes.js';
import { EncodingError } from './errors.js';

export type { TransferDataType, DecodedTransferData, DecodedAbiPayload, DecodedMetadataPayload } from '@aboutcircles/sdk-types';

// ============================================================================
// CONSTANTS
// ============================================================================

const VERSION_BYTES = 1;
const TYPE_BYTES = 2;
const LENGTH_BYTES = 2;
const HEADER_BYTES = VERSION_BYTES + TYPE_BYTES + LENGTH_BYTES; // 5

// ============================================================================
// HELPERS
// ============================================================================

function numToHex(value: number, byteLength: number): string {
  return value.toString(16).padStart(byteLength * 2, '0');
}

function hexNum(hex: string, offset: number, length: number): number {
  return parseInt(hex.slice(offset, offset + length * 2), 16);
}

function cidToHex(cid: string): string {
  try {
    const parsed = CID.parse(cid, base58btc);
    const v1 = parsed.toV1();
    // base16 (hex) encoding includes 'f' prefix - strip it
    const encoded = v1.toString(base16);
    return encoded.startsWith('f') ? encoded.slice(1) : encoded;
  } catch {
    // Try as CIDv1 directly
    const parsed = CID.parse(cid);
    const v1 = parsed.toV1();
    const encoded = v1.toString(base16);
    return encoded.startsWith('f') ? encoded.slice(1) : encoded;
  }
}

const METADATA_SEPARATOR = '480a868a'; // keccak256("metadataStart") first 4 bytes

function hexToCid(hex: string): string {
  const bytes = hexToBytes(hex.startsWith('0x') ? hex : `0x${hex}`);
  const cid = CID.decode(bytes);
  // Return CIDv0 if compatible (dag-pb + sha2-256), otherwise CIDv1
  const isDagPb = cid.code === 0x70;
  const isSha256 = cid.multihash.code === 0x12;
  if (isDagPb && isSha256) {
    return cid.toV0().toString();
  }
  return cid.toString();
}
// @todo construct lookup table based on the contracts in the core pkg
// ============================================================================
// LOCAL SELECTOR LOOKUP TABLE
// ============================================================================

/** Known function signatures for local selector resolution. */
const KNOWN_SIGNATURES: string[] = [
  // ERC20
  'transfer(address,uint256)',
  'transferFrom(address,address,uint256)',
  'approve(address,uint256)',
  'increaseAllowance(address,uint256)',
  'decreaseAllowance(address,uint256)',
  'balanceOf(address)',
  'allowance(address,address)',
  'totalSupply()',
  'decimals()',
  'permit(address,address,uint256,uint256,uint8,bytes32,bytes32)',
  // ERC1155
  'safeTransferFrom(address,address,uint256,uint256,bytes)',
  'safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)',
  'setApprovalForAll(address,bool)',
  'isApprovedForAll(address,address)',
  // Circles Hub V2
  'trust(address,uint96)',
  'isTrusted(address,address)',
  'isHuman(address)',
  'wrap(address,uint256,uint8)',
  'toTokenId(address)',
  'operateFlowMatrix(address[],tuple[],tuple[],bytes)',
  // Wrapped Circles
  'unwrap(uint256)',
  'convertDemurrageToInflationaryValue(uint256,uint64)',
  'convertInflationaryToDemurrageValue(uint256,uint64)',
  // Safe
  'enableModule(address)',
  'isModuleEnabled(address)',
  // Invitation
  'trustInviter(address)',
  'claimInvite()',
  'claimInvites(uint256)',
  'createAccount(address)',
  'createAccounts(address[])',
  // LiftERC20
  'erc20Circles(uint8,address)',
];

/** Compute 4-byte selector from a function signature string. */
function computeSelector(sig: string): string {
  const hash = keccak_256(new TextEncoder().encode(sig));
  return bytesToHex(hash.slice(0, 4)).slice(2); // strip 0x, 8 hex chars
}

/** Map from 8-char hex selector → full signature string. Built once at module load. */
const SELECTOR_TABLE: Map<string, string> = new Map(
  KNOWN_SIGNATURES.map(sig => [computeSelector(sig), sig])
);

/**
 * Parse a function signature string into param type strings.
 * e.g. "transfer(address,uint256)" → ["address", "uint256"]
 */
function parseSignatureTypes(signature: string): string[] {
  const parenIdx = signature.indexOf('(');
  if (parenIdx === -1) return [];
  const inner = signature.slice(parenIdx + 1, -1);
  if (!inner) return [];
  return inner.split(',').map(t => t.trim()).filter(Boolean);
}

// ============================================================================
// ENCODE
// ============================================================================

/**
 * Encodes payload data for Circles V2 transfer annotations.
 *
 * Format: [version: 1B][type: 2B][length: 2B][payload bytes]
 *
 * Types:
 * - 0x0001: UTF-8 text string
 * - 0x1001: UTF-8 text with metadata (payload[0] = message, payload[1] = metadata string)
 * - 0x0002: Raw 32-byte hex (e.g. XMTP message ID)
 * - 0x0003: IPFS CID string (CIDv0 or CIDv1, converted to hex)
 * - 0x0004: ABI-encoded calldata
 *   - payload[0] can be: a function signature string + params, or raw encoded hex calldata
 *
 * @param payload - Array of values; interpretation depends on type
 * @param type    - Transfer data type (0x0001–0x0004)
 * @param version - Protocol version (default 0x01)
 * @returns 0x-prefixed hex string
 */
export function encodeCrcV2TransferData(
  payload: unknown[],
  type: TransferDataType,
  version: number = 0x01
): Hex {
  let payloadHex: string;

  switch (type) {
    case 0x0001: {
      // UTF-8 text
      const text = payload[0] as string;
      const bytes = new TextEncoder().encode(text);
      payloadHex = bytesToHex(bytes).slice(2);
      break;
    }

    case 0x1001: {
      // UTF-8 text with metadata
      const message = payload[0] as string;
      const metadata = payload[1] as string;
      const messageHex = bytesToHex(new TextEncoder().encode(message)).slice(2);
      const metadataHex = bytesToHex(new TextEncoder().encode(metadata)).slice(2);
      payloadHex = messageHex + METADATA_SEPARATOR + metadataHex;
      break;
    }

    case 0x0002: {
      // Raw hex (XMTP message ID - 32 bytes)
      const raw = payload[0] as string;
      const cleaned = raw.startsWith('0x') ? raw.slice(2) : raw;
      if (cleaned.length !== 64) {
        throw new EncodingError(`Type 0x0002 expects a 32-byte hex value (64 hex chars), got ${cleaned.length / 2} bytes`, {
          code: 'ENCODING_INVALID_LENGTH',
        });
      }
      payloadHex = cleaned.toLowerCase();
      break;
    }

    case 0x0003: {
      // IPFS CID
      const cidStr = payload[0] as string;
      payloadHex = cidToHex(cidStr);
      break;
    }

    case 0x0004: {
      // ABI-encoded calldata
      const first = payload[0] as string;

      if (payload.length === 1 && first.startsWith('0x')) {
        // Raw pre-encoded calldata
        payloadHex = first.slice(2).toLowerCase();
      } else {
        // Function signature + params
        const signature = first; // e.g. "transfer(address,uint256)"
        const parenIdx = signature.indexOf('(');
        if (parenIdx === -1) {
          throw new EncodingError('Type 0x0004 payload[0] must be a function signature like "transfer(address,uint256)"', {
            code: 'ENCODING_INVALID_SIGNATURE',
          });
        }
        const fnName = signature.slice(0, parenIdx);
        const paramTypes = signature
          .slice(parenIdx + 1, -1)
          .split(',')
          .map(t => t.trim())
          .filter(Boolean);

        const abiInputs = paramTypes.map((t, i) => ({ type: t, name: `p${i}` }));
        const args = payload.slice(1);

        const encoded = encodeFunctionData({
          abi: [{ name: fnName, type: 'function', stateMutability: 'nonpayable', inputs: abiInputs, outputs: [] }],
          functionName: fnName,
          args,
        });
        payloadHex = encoded.slice(2).toLowerCase();
      }
      break;
    }

    default:
      throw new EncodingError(`Unsupported transfer data type: ${type}`, {
        code: 'ENCODING_UNSUPPORTED_TYPE',
        context: { type },
      });
  }

  const payloadBytes = payloadHex.length / 2;
  const header =
    numToHex(version, VERSION_BYTES) +
    numToHex(type, TYPE_BYTES) +
    numToHex(payloadBytes, LENGTH_BYTES);

  return `0x${header}${payloadHex}`;
}

// ============================================================================
// DECODE
// ============================================================================

/**
 * Decodes Circles V2 transfer data annotation from hex.
 *
 * @param encoded - 0x-prefixed hex string (as returned from circles_getTransferData)
 * @param version - Expected protocol version (default 0x01); throws if mismatch
 * @returns Decoded struct with type, length, and payload
 */
export function decodeCrcV2TransferData(
  encoded: string,
  version: number = 0x01
): DecodedTransferData {
  const hex = encoded.startsWith('0x') ? encoded.slice(2) : encoded;

  if (hex.length < HEADER_BYTES * 2) {
    throw new EncodingError('Encoded data too short to contain header', {
      code: 'ENCODING_TOO_SHORT',
      context: { encoded },
    });
  }

  const encodedVersion = hexNum(hex, 0, VERSION_BYTES);
  if (encodedVersion !== version) {
    throw new EncodingError(`Version mismatch: expected ${version}, got ${encodedVersion}`, {
      code: 'ENCODING_VERSION_MISMATCH',
      context: { expected: version, got: encodedVersion },
    });
  }

  const type = hexNum(hex, VERSION_BYTES * 2, TYPE_BYTES);
  const length = hexNum(hex, (VERSION_BYTES + TYPE_BYTES) * 2, LENGTH_BYTES);
  const payloadHex = hex.slice(HEADER_BYTES * 2, HEADER_BYTES * 2 + length * 2);

  if (payloadHex.length !== length * 2) {
    throw new EncodingError('Payload length mismatch', {
      code: 'ENCODING_LENGTH_MISMATCH',
      context: { expected: length, got: payloadHex.length / 2 },
    });
  }

  let payload: DecodedTransferData['payload'];

  switch (type) {
    case 0x0001: {
      // UTF-8 text
      const bytes = hexToBytes(`0x${payloadHex}`);
      payload = new TextDecoder().decode(bytes);
      break;
    }

    case 0x1001: {
      // UTF-8 text with metadata
      const separatorIdx = payloadHex.indexOf(METADATA_SEPARATOR);
      if (separatorIdx === -1) {
        throw new EncodingError('Type 0x1001: metadata separator not found in payload', {
          code: 'ENCODING_MISSING_SEPARATOR',
        });
      }
      const messageHex = payloadHex.slice(0, separatorIdx);
      const metadataHex = payloadHex.slice(separatorIdx + METADATA_SEPARATOR.length);
      const message = new TextDecoder().decode(hexToBytes(`0x${messageHex}`));
      const metadata = new TextDecoder().decode(hexToBytes(`0x${metadataHex}`));
      payload = { message, metadata };
      break;
    }

    case 0x0002: {
      // Raw hex
      payload = `0x${payloadHex}` as Hex;
      break;
    }

    case 0x0003: {
      // IPFS CID (hex → CID string)
      payload = hexToCid(payloadHex);
      break;
    }

    case 0x0004: {
      // ABI-encoded calldata — try local selector lookup, fallback to raw data
      const selectorHex = payloadHex.slice(0, 8);
      const selector = `0x${selectorHex}` as Hex;
      const signature = SELECTOR_TABLE.get(selectorHex);

      if (signature) {
        const paramTypes = parseSignatureTypes(signature);
        const paramsHex = payloadHex.slice(8);
        const params = paramTypes.length > 0
          ? decodeAbiParameters(paramTypes, paramsHex)
          : [];
        payload = { selector, signature, params };
      } else {
        // Unknown selector — return raw calldata hex
        payload = `0x${payloadHex}` as Hex;
      }
      break;
    }

    default:
      throw new EncodingError(`Unsupported transfer data type: ${type}`, {
        code: 'ENCODING_UNSUPPORTED_TYPE',
        context: { type },
      });
  }

  return { type: type as TransferDataType, length, payload };
}
