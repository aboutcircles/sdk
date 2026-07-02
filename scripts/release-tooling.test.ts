import { describe, expect, test } from "bun:test";
import { nextVersion, parseVersion } from "./bump-version";
import { isPrerelease, pinInternalDeps } from "./publish";

describe("parseVersion", () => {
  test("parses a stable version", () => {
    expect(parseVersion("0.1.57")).toEqual({
      major: 0,
      minor: 1,
      patch: 57,
      preid: undefined,
      prenum: undefined,
    });
  });

  test("parses a prerelease version", () => {
    expect(parseVersion("0.1.58-rc.3")).toEqual({
      major: 0,
      minor: 1,
      patch: 58,
      preid: "rc",
      prenum: 3,
    });
  });

  test("throws on a malformed version instead of yielding NaN", () => {
    expect(() => parseVersion("0.1")).toThrow();
    expect(() => parseVersion("0.1.x")).toThrow();
    // The bug the regex guards against: the old split(".").map(Number) turned
    // this into [0, 1, NaN, 0].
    expect(() => parseVersion("0.1.58-rc")).toThrow();
  });
});

describe("nextVersion — stable bumps", () => {
  test("patch from stable", () => {
    expect(nextVersion("0.1.57", "patch")).toBe("0.1.58");
  });
  test("minor from stable resets patch", () => {
    expect(nextVersion("0.1.57", "minor")).toBe("0.2.0");
  });
  test("major from stable resets minor+patch", () => {
    expect(nextVersion("0.1.57", "major")).toBe("1.0.0");
  });
  test("major/minor drop an in-flight prerelease", () => {
    expect(nextVersion("0.1.58-rc.2", "minor")).toBe("0.2.0");
    expect(nextVersion("0.1.58-rc.2", "major")).toBe("1.0.0");
  });
});

describe("nextVersion — prerelease lifecycle", () => {
  test("opens an RC for the next patch from a stable version", () => {
    expect(nextVersion("0.1.57", "prerelease")).toBe("0.1.58-rc.0");
  });
  test("bumps the counter on a matching-preid RC", () => {
    expect(nextVersion("0.1.58-rc.0", "prerelease")).toBe("0.1.58-rc.1");
    expect(nextVersion("0.1.58-rc.9", "prerelease")).toBe("0.1.58-rc.10");
  });
  test("restarts the counter when the preid changes", () => {
    expect(nextVersion("0.1.58-rc.4", "prerelease", "beta")).toBe(
      "0.1.58-beta.0",
    );
  });
  test("patch finalizes an RC to its release core (no version skipped)", () => {
    expect(nextVersion("0.1.58-rc.0", "patch")).toBe("0.1.58");
    expect(nextVersion("0.1.58-rc.5", "patch")).toBe("0.1.58");
  });
  test("full cycle: stable -> rc.0 -> rc.1 -> finalize", () => {
    const rc0 = nextVersion("0.1.57", "prerelease");
    const rc1 = nextVersion(rc0, "prerelease");
    const stable = nextVersion(rc1, "patch");
    expect([rc0, rc1, stable]).toEqual(["0.1.58-rc.0", "0.1.58-rc.1", "0.1.58"]);
  });
});

describe("isPrerelease", () => {
  test("true only when a prerelease suffix is present", () => {
    expect(isPrerelease("0.1.58")).toBe(false);
    expect(isPrerelease("0.1.58-rc.0")).toBe(true);
  });
});

describe("pinInternalDeps", () => {
  test("pins internal @aboutcircles/* deps to the exact version, leaves others", () => {
    const pkg = {
      name: "@aboutcircles/sdk",
      version: "0.1.58-rc.0",
      dependencies: {
        "@aboutcircles/sdk-rpc": "*",
        "@aboutcircles/sdk-types": "*",
        viem: "^2.0.0",
      },
    };
    const pinned = pinInternalDeps(pkg, "0.1.58-rc.0");
    expect(pinned.dependencies).toEqual({
      "@aboutcircles/sdk-rpc": "0.1.58-rc.0",
      "@aboutcircles/sdk-types": "0.1.58-rc.0",
      viem: "^2.0.0",
    });
  });

  test("covers peer and optional dependency buckets", () => {
    const pkg = {
      peerDependencies: { "@aboutcircles/sdk-core": "*" },
      optionalDependencies: { "@aboutcircles/sdk-utils": "*" },
    };
    const pinned = pinInternalDeps(pkg, "1.2.3-rc.1");
    expect(pinned.peerDependencies["@aboutcircles/sdk-core"]).toBe("1.2.3-rc.1");
    expect(pinned.optionalDependencies["@aboutcircles/sdk-utils"]).toBe(
      "1.2.3-rc.1",
    );
  });

  test("does not mutate the input object", () => {
    const pkg = { dependencies: { "@aboutcircles/sdk-rpc": "*" } };
    pinInternalDeps(pkg, "0.1.58-rc.0");
    expect(pkg.dependencies["@aboutcircles/sdk-rpc"]).toBe("*");
  });

  test("is a no-op when there are no dependency fields", () => {
    expect(pinInternalDeps({ name: "x" }, "0.1.58-rc.0")).toEqual({ name: "x" });
  });
});
