import { describe, test, expect } from 'bun:test';
import { normalizeFindPathParams } from '../utils.js';
import type { Address, FindPathParams } from '@aboutcircles/sdk-types';

const FROM = '0x42cEDde51198D1773590311E2A340DC06B24cB37' as Address;
const TO = '0x14c16ce62d26fd51582a646e2e30a3267b1e6d7e' as Address;

const baseParams = (): FindPathParams => ({
  from: FROM,
  to: TO,
  targetFlow: 1000n * 10n ** 18n,
});

describe('normalizeFindPathParams', () => {
  test('maps the core fields', () => {
    const result = normalizeFindPathParams(baseParams());

    expect(result.Source).toBe(FROM.toLowerCase());
    expect(result.Sink).toBe(TO.toLowerCase());
    expect(result.TargetFlow).toBe('1000000000000000000000');
  });

  test('forwards quantizedMode and debugShowIntermediateSteps', () => {
    const result = normalizeFindPathParams({
      ...baseParams(),
      quantizedMode: true,
      debugShowIntermediateSteps: true,
    });

    expect(result.QuantizedMode).toBe(true);
    expect(result.DebugShowIntermediateSteps).toBe(true);
  });

  test('normalizes simulatedConsentedAvatars to lowercase', () => {
    const result = normalizeFindPathParams({
      ...baseParams(),
      simulatedConsentedAvatars: [FROM, TO],
    });

    expect(result.SimulatedConsentedAvatars).toEqual([FROM.toLowerCase(), TO.toLowerCase()]);
  });

  test('omits the new fields from the wire payload when unset', () => {
    // Undefined values are dropped by JSON.stringify — the request stays backward compatible.
    const serialized = JSON.parse(JSON.stringify(normalizeFindPathParams(baseParams())));

    expect('QuantizedMode' in serialized).toBe(false);
    expect('DebugShowIntermediateSteps' in serialized).toBe(false);
    expect('SimulatedConsentedAvatars' in serialized).toBe(false);
  });
});
