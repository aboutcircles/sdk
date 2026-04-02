import type { HttpTransport } from './http.js';
import type { AuthContext } from './authContext.js';
import type { WalletProvider, SignersClient, AvatarSigner } from './signers.js';

export interface AuthClient {
  signInWithAvatar(options: {
    avatar: string;
    ethereum: WalletProvider;
    chainId?: number;
  }): Promise<{ address: string; chainId: number }>;

  signOut(): void;

  getAuthMeta(): { address: string; chainId: number } | null;
}

export class AuthClientImpl implements AuthClient {
  constructor(
    private readonly marketApiBase: string,
    private readonly http: HttpTransport,
    private readonly authContext: AuthContext,
    private readonly signers: SignersClient,
  ) {}

  private baseUrl(): string {
    return this.marketApiBase.replace(/\/$/, '');
  }

  async signInWithAvatar(options: {
    avatar: string;
    ethereum: WalletProvider;
    chainId?: number;
  }): Promise<{ address: string; chainId: number }> {
    const chainId = options.chainId ?? 100;

    const ch = await this.http.request<{
      challengeId: string;
      message: string;
    }>({
      method: 'POST',
      url: `${this.baseUrl()}/api/auth/challenge`,
      body: { address: options.avatar, chainId },
    });

    const msgBytes = new TextEncoder().encode(ch.message);

    const safeSigner: AvatarSigner = await this.signers.createSafeSignerForAvatar({
      avatar: options.avatar,
      ethereum: options.ethereum,
      chainId: BigInt(chainId),
      enforceChainId: true,
    });

    const signature = await safeSigner.signBytes(msgBytes);

    const sig = signature as any;
    if (typeof sig !== 'string') throw new Error('Wallet returned a non-string signature');
    const trimmed = (sig as string).trim();
    if (!/^0x[0-9a-fA-F]+$/.test(trimmed)) throw new Error('Wallet returned an invalid signature format (expected 0x-prefixed hex)');

    const verify = await this.http.request<{
      token: string;
      expiresIn: number;
      address: string;
      chainId: number;
    }>({
      method: 'POST',
      url: `${this.baseUrl()}/api/auth/verify`,
      body: { challengeId: ch.challengeId, signature: trimmed },
    });

    this.authContext.setToken(verify.token, verify.expiresIn, verify.address, verify.chainId);
    return { address: verify.address, chainId: verify.chainId };
  }

  signOut(): void {
    this.authContext.clear();
  }

  getAuthMeta(): { address: string; chainId: number } | null {
    return this.authContext.getMeta();
  }
}
