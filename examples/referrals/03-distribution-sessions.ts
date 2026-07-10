import { Distributions, DispenseError } from "@aboutcircles/sdk-referrals";

/**
 * Distribution Sessions Example
 *
 * Distribution sessions gate access to an inviter's referral key pool
 * via quota, expiry, and pause controls. Each session gets a unique slug
 * for QR codes / shareable links.
 *
 * Flow: create session → share slug → keys dispensed → pause/update → delete
 *
 * Backend: https://staging.circlesubi.network/referrals
 */

const REFERRALS_URL = "https://staging.circlesubi.network/referrals";
const INVITER = "0x1234567890123456789012345678901234567890";

const distributions = new Distributions(REFERRALS_URL);

async function example1_CreateSession() {
  console.log("=== 1. Create a Distribution Session ===\n");

  const session = await distributions.createSession({
    inviterAddress: INVITER,
    quota: 50,
    label: "ETHDenver 2026 booth",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
  });

  console.log("Session created:");
  console.log("  ID:", session.id);
  console.log("  Slug:", session.slug);
  console.log("  Quota:", session.quota);
  console.log("  URL:", session.distributionUrl ?? "(DISTRIBUTION_BASE_URL not set)");
  console.log();

  return session;
}

async function example2_ListSessions() {
  console.log("=== 2. List Sessions for an Inviter ===\n");

  const result = await distributions.listSessions(INVITER, { limit: 10 });

  console.log(`Found ${result.total} session(s):\n`);
  for (const s of result.sessions) {
    console.log(`  [${s.slug}] "${s.label ?? "(no label)"}" — ${s.dispensedCount}/${s.quota} dispensed, paused=${s.paused}`);
  }
  console.log();
}

async function example3_UpdateSession(id: string) {
  console.log("=== 3. Pause a Session ===\n");

  const updated = await distributions.updateSession(id, { paused: true });

  console.log("Session paused:");
  console.log("  Paused:", updated.paused);
  console.log("  Updated at:", updated.updatedAt);
  console.log();
}

async function example4_GetSession(id: string) {
  console.log("=== 4. Get Session Details ===\n");

  const session = await distributions.getSession(id);

  console.log("Session details:");
  console.log("  Slug:", session.slug);
  console.log("  Inviter:", session.inviterAddress);
  console.log("  Quota:", session.quota);
  console.log("  Dispensed:", session.dispensedCount);
  console.log("  Paused:", session.paused);
  console.log("  Expires:", session.expiresAt ?? "never");
  console.log();
}

async function example5_DispenseKey(slug: string) {
  console.log("=== 5. Dispense a Key via Session Slug ===\n");

  try {
    const result = await distributions.dispense(slug);

    console.log("Key dispensed:");
    console.log("  Private key:", result.privateKey.slice(0, 10) + "...");
    console.log("  Inviter:", result.inviter);
    console.log("  Claim URL:", result.claimUrl ?? "(DISTRIBUTION_BASE_URL not set)");
    console.log("  Session slug:", result.sessionSlug);
  } catch (error) {
    if (error instanceof DispenseError) {
      // Typed error handling — show appropriate UI per error code
      switch (error.code) {
        case "SESSION_PAUSED":
          console.log("Session is paused — try again later.");
          break;
        case "SESSION_EXPIRED":
          console.log("Session expired or quota exhausted.");
          break;
        case "POOL_EMPTY":
          console.log("No more keys available in the inviter's pool.");
          break;
        case "SESSION_NOT_FOUND":
          console.log("Session not found — check the slug.");
          break;
        default:
          console.log(`Dispense failed: ${error.message} (${error.code})`);
      }
    } else {
      throw error;
    }
  }
  console.log();
}

async function example6_DeleteSession(id: string) {
  console.log("=== 6. Delete Session ===\n");

  await distributions.deleteSession(id);
  console.log("Session deleted (only works if dispensedCount === 0).\n");
}

async function runExamples() {
  try {
    const session = await example1_CreateSession();
    await example2_ListSessions();
    await example5_DispenseKey(session.slug);
    await example3_UpdateSession(session.id);
    await example4_GetSession(session.id);
    // Note: delete will fail if a key was dispensed (audit trail)
    // await example6_DeleteSession(session.id);

    console.log("=== All examples complete ===");
  } catch (error) {
    console.error("Error:", error);
    console.log("\nNote: examples require a running backend with keys stored for the inviter.");
  }
}

runExamples();

export {
  example1_CreateSession,
  example2_ListSessions,
  example3_UpdateSession,
  example4_GetSession,
  example5_DispenseKey,
  example6_DeleteSession,
};
