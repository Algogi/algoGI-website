import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getBaseUrl, resolveMediaUrl } from "@/lib/email/base-url";

describe("resolveMediaUrl", () => {
  const base = "https://algogi.com";

  it("prefixes leading slash with base URL", () => {
    assert.equal(
      resolveMediaUrl("/images/foo.png", base),
      "https://algogi.com/images/foo.png"
    );
  });

  it("leaves absolute URLs untouched", () => {
    const absolute = "https://cdn.example.com/a.png";
    assert.equal(resolveMediaUrl(absolute, base), absolute);
  });

  it("joins relative paths to base URL", () => {
    assert.equal(
      resolveMediaUrl("images/bar.png", base),
      "https://algogi.com/images/bar.png"
    );
  });
});

describe("getBaseUrl", () => {
  it("falls back to localhost when env not set", () => {
    const result = getBaseUrl();
    assert.ok(result.startsWith("http"));
  });
});

