export type Hex = `0x${string}`;

export function isAbsoluteUri(u: unknown): u is string {
  if (typeof u !== 'string') return false;
  try {
    const url = new URL(u);
    return !!url.protocol && !!url.hostname;
  } catch {
    return false;
  }
}

export function normalizeEvmAddress(v: unknown): string {
  if (typeof v !== 'string') throw new Error(`Invalid address: ${String(v)}`);
  const s = v.trim().toLowerCase();
  if (!/^0x[a-f0-9]{40}$/.test(s)) throw new Error(`Invalid address: ${v}`);
  return s;
}

export function isEvmAddress(v: unknown): v is string {
  if (typeof v !== 'string') return false;
  const s = v.trim();
  return /^0x[a-fA-F0-9]{40}$/.test(s);
}

export function normalizeHex32(v: unknown, name: string): Hex | undefined {
  if (v == null) return undefined;
  if (typeof v !== 'string') throw new Error(`${name} must be a hex string`);
  const s = v.trim().toLowerCase();
  if (s.length === 0) return undefined;
  if (!/^0x[0-9a-f]{64}$/.test(s)) throw new Error(`${name} must be a 32-byte hex string`);
  return s as Hex;
}

export function isValidSku(sku: string): boolean {
  return /^[a-z0-9][a-z0-9-_]{0,62}$/.test(sku);
}

export function assertSku(sku: string): void {
  if (!isValidSku(sku)) throw new Error('Invalid SKU');
}
