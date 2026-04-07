export function isValidSku(sku: string): boolean {
  return /^[a-z0-9][a-z0-9-_]{0,62}$/.test(sku);
}

export function assertSku(sku: string): void {
  if (!isValidSku(sku)) throw new Error('Invalid SKU');
}
