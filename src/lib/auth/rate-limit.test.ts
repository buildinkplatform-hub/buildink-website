import { beforeEach, describe, expect, it, vi } from "vitest"

const redisMocks = vi.hoisted(() => ({
  eval: vi.fn(),
  ttl: vi.fn(),
}))

vi.mock("@upstash/redis", () => ({
  Redis: class MockRedis {
    eval = redisMocks.eval
    ttl = redisMocks.ttl
  },
}))

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(
    new Headers({
      "x-real-ip": "203.0.113.10",
    }),
  ),
}))

import { limitAuthAction } from "./rate-limit"

describe("limitAuthAction", () => {
  beforeEach(() => {
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.test"
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token"
    redisMocks.eval.mockReset()
    redisMocks.ttl.mockReset()
  })

  it("increments and applies expiry in one atomic script", async () => {
    redisMocks.eval.mockResolvedValue(1)

    await expect(
      limitAuthAction("password-login", "User@Example.com", 10, 900),
    ).resolves.toBeUndefined()

    expect(redisMocks.eval).toHaveBeenCalledTimes(1)
    const [script, keys, args] = redisMocks.eval.mock.calls[0] ?? []
    expect(String(script)).toContain('redis.call("INCR", KEYS[1])')
    expect(String(script)).toContain('redis.call("TTL", KEYS[1])')
    expect(String(script)).toContain('redis.call("EXPIRE", KEYS[1], ARGV[1])')
    expect(keys).toHaveLength(1)
    expect(String(keys[0])).toContain("buildink:auth:password-login:")
    expect(args).toEqual(["900"])
  })

  it("returns the Redis TTL when the limit is exceeded", async () => {
    redisMocks.eval.mockResolvedValue(11)
    redisMocks.ttl.mockResolvedValue(73)

    await expect(
      limitAuthAction("password-login", "user@example.com", 10, 900),
    ).rejects.toMatchObject({
      retryAfterSeconds: 73,
    })
  })
})
