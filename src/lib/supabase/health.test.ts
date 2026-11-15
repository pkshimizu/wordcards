import { describe, expect, it, vi } from "vitest";
import { checkSupabaseHealth } from "./health";

const env = {
  url: "http://127.0.0.1:54321",
  publishableKey: "sb_publishable_test",
};

describe("checkSupabaseHealth", () => {
  it("設定がなければ not_configured", async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    await expect(checkSupabaseHealth(null, fetchImpl)).resolves.toEqual({
      status: "not_configured",
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("Auth のヘルスチェックが 200 なら ok", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("{}", { status: 200 }));
    await expect(checkSupabaseHealth(env, fetchImpl)).resolves.toEqual({
      status: "ok",
    });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(String(url)).toBe("http://127.0.0.1:54321/auth/v1/health");
    expect(init?.headers).toEqual({ apikey: "sb_publishable_test" });
  });

  it("200 以外なら error", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("", { status: 503 }));
    await expect(checkSupabaseHealth(env, fetchImpl)).resolves.toEqual({
      status: "error",
      detail: "HTTP 503",
    });
  });

  it("通信に失敗したら error", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error("fetch failed"));
    await expect(checkSupabaseHealth(env, fetchImpl)).resolves.toEqual({
      status: "error",
      detail: "fetch failed",
    });
  });
});
