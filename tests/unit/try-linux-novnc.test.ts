import { afterEach, describe, expect, it } from "vitest";
import { tryLinuxNovncUrls } from "@/lib/site/try-linux-novnc";

describe("tryLinuxNovncUrls", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_TRY_LINUX_PROXY_BASE;
    delete process.env.NEXT_PUBLIC_TRY_LINUX_ACCESS_TOKEN;
  });

  it("returns null when base unset", () => {
    expect(tryLinuxNovncUrls()).toBeNull();
  });

  it("builds mint and fedora URLs", () => {
    process.env.NEXT_PUBLIC_TRY_LINUX_PROXY_BASE = "http://lab:8080";
    expect(tryLinuxNovncUrls()).toEqual({
      mint: "http://lab:8080/try/mint/vnc_lite.html",
      fedora: "http://lab:8080/try/fedora/vnc_lite.html",
    });
  });

  it("appends access_token when set", () => {
    process.env.NEXT_PUBLIC_TRY_LINUX_PROXY_BASE = "http://lab:8080";
    process.env.NEXT_PUBLIC_TRY_LINUX_ACCESS_TOKEN = "demo-secret";
    const u = tryLinuxNovncUrls();
    expect(u?.mint).toContain("access_token=demo-secret");
    expect(u?.fedora).toContain("access_token=demo-secret");
  });
});
