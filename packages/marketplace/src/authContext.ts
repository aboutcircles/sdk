export interface AuthContextMeta {
  address: string;
  chainId: number;
}

export interface AuthContext {
  getToken(): string | null;
  setToken(token: string, expSeconds: number, addr: string, chainId: number): void;
  clear(): void;
  getMeta(): AuthContextMeta | null;
}

export class InMemoryAuthContext implements AuthContext {
  private token: string | null = null;
  private exp: number | null = null;
  private meta: AuthContextMeta | null = null;
  private readonly expiryGraceSeconds = 15;

  getToken(): string | null {
    if (!this.token || !this.exp) return null;
    const now = Math.floor(Date.now() / 1000);
    if (now >= (this.exp - this.expiryGraceSeconds)) return null;
    return this.token;
  }

  setToken(token: string, expSeconds: number, addr: string, chainId: number): void {
    this.token = token;
    this.exp = Math.floor(Date.now() / 1000) + expSeconds;
    this.meta = { address: addr.toLowerCase(), chainId };
  }

  clear(): void {
    this.token = null;
    this.exp = null;
    this.meta = null;
  }

  getMeta(): AuthContextMeta | null {
    return this.getToken() ? this.meta : null;
  }
}
