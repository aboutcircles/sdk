import type { Sdk } from '@aboutcircles/sdk';
import type { ProfilesBindings, MediaBindings, Cid } from './namespaces.js';

function defaultGatewayUrlForCid(cid: string): string {
  return `https://da08cae2-8b50-45dc-80b9-48925be78ec8.myfilebase.com/ipfs/${cid}`;
}

function assertCidV0(v: unknown): string {
  if (typeof v !== 'string') throw new Error(`Pin API returned invalid cid: ${String(v)}`);
  const cid = v.trim();
  if (!/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(cid)) throw new Error(`Pin API returned invalid cid: ${String(v)}`);
  return cid;
}

export function createCirclesSdkProfilesBindings(opts: {
  circlesSdk: Sdk;
  pinApiBase?: string;
  gatewayUrlForCid?: (cid: string) => string;
  maxJsonBytes?: number;
  maxMediaBytes?: number;
}): { bindings: ProfilesBindings; media: MediaBindings } {
  const { circlesSdk } = opts;
  if (!circlesSdk) throw new Error('Circles SDK not initialized');

  const base = (opts.pinApiBase ?? '').replace(/\/$/, '');
  const pinUrl = base ? `${base}/api/pin` : '';
  const pinMediaUrl = base ? `${base}/api/pin-media` : '';
  const gateway = opts.gatewayUrlForCid ?? defaultGatewayUrlForCid;
  const MAX_JSON = opts.maxJsonBytes ?? 8 * 1024 * 1024;
  const MAX_MEDIA = opts.maxMediaBytes ?? 8 * 1024 * 1024;

  async function putJsonLd(obj: unknown): Promise<Cid> {
    if (!pinUrl) throw new Error('pinApiBase not provided; cannot call /api/pin');
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    if (bytes.length > MAX_JSON) throw new Error('JSON-LD too large: exceeds upload limit');
    const res = await fetch(pinUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/ld+json; charset=utf-8', Accept: 'application/ld+json' },
      body: bytes,
    });
    if (!res.ok) {
      let detail = '';
      try { detail = await res.text(); } catch {}
      throw new Error(`Pin API error ${res.status}: ${detail || res.statusText}`);
    }
    const body: any = await res.json().catch(() => ({}));
    return assertCidV0(body?.cid);
  }

  async function getJsonLd(cid: Cid): Promise<unknown> {
    const url = gateway(cid);
    const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json, application/ld+json' } });
    if (!res.ok) throw new Error(`Failed to fetch IPFS JSON: ${res.status} ${res.statusText}`);
    return await res.json();
  }

  async function pinMediaBytes(bytes: Uint8Array, mime?: string | null): Promise<Cid> {
    if (!pinMediaUrl) throw new Error('pinApiBase not provided; cannot call /api/pin-media');
    if (bytes.length > MAX_MEDIA) throw new Error('Image too large: exceeds 8 MiB upload limit.');
    const res = await fetch(pinMediaUrl, {
      method: 'POST',
      headers: { 'Content-Type': mime || 'application/octet-stream', Accept: 'application/json' },
      body: bytes.buffer as ArrayBuffer,
    });
    if (!res.ok) {
      let detail = '';
      try { detail = await res.text(); } catch {}
      throw new Error(`Pin API error ${res.status}: ${detail || res.statusText}`);
    }
    const body: any = await res.json().catch(() => ({}));
    return assertCidV0(body?.cid);
  }

  const bindings: ProfilesBindings = {
    async getLatestProfileCid(avatar: string): Promise<Cid | null> {
      const info = await circlesSdk.data.getAvatar(avatar as any);
      return (info as any)?.cidV0 ?? null;
    },
    putJsonLd,
    getJsonLd,
    async updateAvatarProfileDigest(avatar: string, profileCid: Cid): Promise<string> {
      const avatarObj = await circlesSdk.getAvatar(avatar as any);
      const receipt = await avatarObj.profile.updateMetadata(profileCid);
      return ((receipt as any)?.transactionHash ?? '') as string;
    },
  };

  const media: MediaBindings = { pinMediaBytes, gatewayUrlForCid: gateway };

  return { bindings, media };
}
