import type { MinimalOfferInput, MinimalProductInput } from './offersTypes.js';
import type { AvatarSigner } from './signers.js';
import type { ProfilesBindings, Cid } from './namespaces.js';
import type { CustomDataLink } from './links.js';
import type { Hex } from './utils.js';
import { buildProduct } from './offersJsonld.js';
import { insertIntoHead, loadIndex, loadProfileOrInit, rebaseAndSaveProfile, saveHeadAndIndex } from './namespaces.js';
import { buildLinkDraft, canonicaliseLink } from './canonicalise.js';
import { assertSku, normalizeEvmAddress, normalizeHex32 } from './utils.js';
import { cidV0ToDigest32Strict } from './cid.js';

export interface OffersClient {
  publishOffer(opts: {
    avatar: string;
    operator: string;
    signer: AvatarSigner;
    chainId?: number;
    paymentGateway?: string;
    product: MinimalProductInput;
    offer: MinimalOfferInput;
  }): Promise<{
    productCid: string;
    headCid: string;
    indexCid: string;
    profileCid: string;
    linkCid?: string;
    digest32: Hex;
    txHash?: Hex;
  }>;

  tombstone(opts: {
    avatar: string;
    operator: string;
    signer: AvatarSigner;
    chainId?: number;
    sku: string;
  }): Promise<{
    linkCid?: string;
    headCid: string;
    indexCid: string;
    profileCid: string;
    digest32: Hex;
    txHash?: Hex;
  }>;
}

export class OffersClientImpl implements OffersClient {
  constructor(private readonly bindings?: ProfilesBindings) {}

  private ensureBindings(): ProfilesBindings {
    if (!this.bindings) throw new Error('OffersClient requires profilesBindings to be provided to MarketplaceClient.');
    return this.bindings;
  }

  private assertSignerMatches(avatar: string, chainId: number, signer: AvatarSigner): void {
    if (signer.avatar.toLowerCase() !== avatar) throw new Error(`Signer avatar mismatch. Expected ${avatar}, got ${signer.avatar}`);
    if (signer.chainId !== BigInt(chainId)) throw new Error(`Signer chainId mismatch. Expected ${BigInt(chainId)}, got ${signer.chainId}`);
  }

  private async signAndInsertLink(params: {
    avatar: string;
    operator: string;
    signer: AvatarSigner;
    link: CustomDataLink;
  }): Promise<{ headCid: string; indexCid: string; profileCid: string; digest32: Hex; txHash?: Hex }> {
    const b = this.ensureBindings();
    const { avatar, operator, signer, link } = params;

    const preimage = canonicaliseLink(link);
    link.signature = await signer.signBytes(preimage);

    const { profile } = await loadProfileOrInit(b, avatar);
    const currentIndexCid: string | null = profile.namespaces?.[operator] ?? null;
    const { index, head } = await loadIndex(b, currentIndexCid);
    const { closedHead } = insertIntoHead(head, link);
    const { headCid, indexCid } = await saveHeadAndIndex(b, head, index, closedHead);

    const profileCid = await rebaseAndSaveProfile(b, avatar, (prof) => {
      prof.namespaces[operator] = indexCid;
    });

    const txHash = await b.updateAvatarProfileDigest(avatar, profileCid);
    const txHashOpt = normalizeHex32(txHash, 'txHash');
    const digest32 = cidV0ToDigest32Strict(profileCid);

    return { headCid, indexCid, profileCid, digest32, txHash: txHashOpt };
  }

  async publishOffer(opts: {
    avatar: string;
    operator: string;
    signer: AvatarSigner;
    chainId?: number;
    paymentGateway?: string;
    product: MinimalProductInput;
    offer: MinimalOfferInput;
  }): Promise<{ productCid: string; headCid: string; indexCid: string; profileCid: string; linkCid?: string; digest32: Hex; txHash?: Hex }> {
    const b = this.ensureBindings();
    const chainId = opts.chainId ?? 100;
    const avatar = normalizeEvmAddress(opts.avatar);
    const operator = normalizeEvmAddress(opts.operator);
    const gateway = opts.paymentGateway ? normalizeEvmAddress(opts.paymentGateway) : undefined;
    this.assertSignerMatches(avatar, chainId, opts.signer);
    assertSku(opts.product.sku);

    const productObj: any = buildProduct(opts.product, opts.offer);
    const offerArray = Array.isArray(productObj.offers) ? productObj.offers : [];
    const offer0 = offerArray[0] as any;
    if (offer0) {
      const payTo = gateway ?? avatar;
      offer0.potentialAction = {
        '@type': 'PayAction',
        price: offer0.price,
        priceCurrency: offer0.priceCurrency,
        recipient: { '@id': `eip155:${chainId}:${payTo}` },
        instrument: {
          '@type': 'PropertyValue',
          propertyID: 'eip155',
          value: `${chainId}:${payTo}`,
          name: 'pay-to',
        },
      };
    }

    const productCid = await b.putJsonLd(productObj);

    const link: CustomDataLink = await buildLinkDraft({
      name: `product/${opts.product.sku}`,
      cid: productCid,
      chainId,
      signerAddress: avatar,
    });

    const res = await this.signAndInsertLink({ avatar, operator, signer: opts.signer, link });
    return { productCid, ...res };
  }

  async tombstone(opts: {
    avatar: string;
    operator: string;
    signer: AvatarSigner;
    chainId?: number;
    sku: string;
  }): Promise<{ linkCid?: string; headCid: string; indexCid: string; profileCid: string; digest32: Hex; txHash?: Hex }> {
    const b = this.ensureBindings();
    const chainId = opts.chainId ?? 100;
    const avatar = normalizeEvmAddress(opts.avatar);
    const operator = normalizeEvmAddress(opts.operator);
    this.assertSignerMatches(avatar, chainId, opts.signer);
    assertSku(opts.sku);

    const nowSec = Math.floor(Date.now() / 1000);
    const tomb = {
      '@context': 'https://aboutcircles.com/contexts/circles-market/',
      '@type': 'Tombstone',
      sku: opts.sku,
      at: nowSec,
    };
    const payloadCid = await b.putJsonLd(tomb);

    const link: CustomDataLink = await buildLinkDraft({
      name: `product/${opts.sku}`,
      cid: payloadCid,
      chainId,
      signerAddress: avatar,
    });

    return await this.signAndInsertLink({ avatar, operator, signer: opts.signer, link });
  }
}
