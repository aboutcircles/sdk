import type { Profile, GroupProfile } from '@aboutcircles/sdk-types';

export type { Profile, GroupProfile };

export class Profiles {
  private readonly baseUrl: string;

  constructor(circlesRpcUrl: string, profileServiceUrl?: string) {
    if (profileServiceUrl) {
      const base = profileServiceUrl.endsWith('/') ? profileServiceUrl : `${profileServiceUrl}/`;
      this.baseUrl = base;
    } else {
      const base = circlesRpcUrl.endsWith('/') ? circlesRpcUrl : `${circlesRpcUrl}/`;
      this.baseUrl = `${base}profiles/`;
    }
  }

  private getProfileServiceUrl(): string {
    return this.baseUrl;
  }

  /**
   * Creates and pins a new profile, returning its CID.
   * @param profile The profile data to pin.
   * @returns The CID of the pinned profile.
   */
  async create(profile: Profile): Promise<string> {
    const response = await fetch(`${this.getProfileServiceUrl()}pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create profile. Status: ${response.status} ${response.statusText}. Body: ${await response.text()}`
      );
    }

    const data = await response.json() as { cid: string };
    return data.cid;
  }

  /**
   * Retrieves a profile by its CID.
   * @param cid The CID of the profile to retrieve.
   * @returns The profile data, or undefined if not found.
   */
  async get(cid: string): Promise<Profile | undefined> {
    const response = await fetch(`${this.getProfileServiceUrl()}get?cid=${cid}`);
    const body = await response.text();

    if (!response.ok) {
      console.warn(
        `Failed to retrieve profile ${cid}. Status: ${response.status} ${response.statusText}. Body: ${body}`
      );
      return undefined;
    }

    try {
      return JSON.parse(body);
    } catch (e) {
      console.warn(
        `Failed to parse profile ${cid}. Status: ${response.status} ${response.statusText}. Body: ${body}`
      );
      return undefined;
    }
  }
}
