type RedisLimitResponse = Readonly<{
  result?: unknown;
  error?: unknown;
}>;

export type DistributedLimitResult = Readonly<{
  count: number;
  retryAfterSeconds: number;
}>;

export class DistributedLimitUnavailableError extends Error {
  constructor(options?: ErrorOptions) {
    super("The distributed audit limiter is unavailable.", options);
    this.name = "DistributedLimitUnavailableError";
  }
}

const fixedWindowScript = [
  "local count = redis.call('INCR', KEYS[1])",
  "if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end",
  "local ttl = redis.call('PTTL', KEYS[1])",
  "return {count, ttl}",
].join("\n");

export async function consumeDistributedLimit(options: Readonly<{
  key: string;
  windowMs: number;
  redisUrl: string;
  redisToken: string;
  fetchImplementation?: typeof fetch;
}>): Promise<DistributedLimitResult> {
  const fetchImplementation = options.fetchImplementation ?? fetch;

  try {
    const response = await fetchImplementation(options.redisUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "EVAL",
        fixedWindowScript,
        1,
        options.key,
        options.windowMs,
      ]),
      cache: "no-store",
      signal: AbortSignal.timeout(3_000),
    });
    const body = (await response.json().catch(() => null)) as
      | RedisLimitResponse
      | null;
    const result = body?.result;

    if (
      !response.ok ||
      body?.error ||
      !Array.isArray(result) ||
      result.length !== 2 ||
      !Number.isFinite(Number(result[0])) ||
      !Number.isFinite(Number(result[1]))
    ) {
      throw new DistributedLimitUnavailableError();
    }

    return {
      count: Number(result[0]),
      retryAfterSeconds: Math.max(1, Math.ceil(Number(result[1]) / 1_000)),
    };
  } catch (error) {
    if (error instanceof DistributedLimitUnavailableError) {
      throw error;
    }

    throw new DistributedLimitUnavailableError({ cause: error });
  }
}
