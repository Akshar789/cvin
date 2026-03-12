const requestCounts = new Map<number, { count: number; resetTime: number }>();
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 1000;

const IP_RATE_LIMIT = 5;
const IP_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export function checkRateLimit(userId: number): { allowed: boolean; message?: string; resetIn?: number } {
  const now = Date.now();
  const userLimit = requestCounts.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    requestCounts.set(userId, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return { allowed: true };
  }

  if (userLimit.count >= RATE_LIMIT) {
    const resetIn = Math.ceil((userLimit.resetTime - now) / 1000);
    return {
      allowed: false,
      message: `Rate limit exceeded. Please try again in ${resetIn} seconds.`,
      resetIn,
    };
  }

  userLimit.count++;
  return { allowed: true };
}

export function checkIpRateLimit(ipAddress: string): { allowed: boolean; message?: string; resetIn?: number } {
  const now = Date.now();
  const ipLimit = ipRequestCounts.get(ipAddress);

  if (!ipLimit || now > ipLimit.resetTime) {
    ipRequestCounts.set(ipAddress, {
      count: 1,
      resetTime: now + IP_WINDOW_MS,
    });
    return { allowed: true };
  }

  if (ipLimit.count >= IP_RATE_LIMIT) {
    const resetIn = Math.ceil((ipLimit.resetTime - now) / 1000);
    const resetInMinutes = Math.ceil(resetIn / 60);
    return {
      allowed: false,
      message: `Rate limit exceeded for anonymous users. Please try again in ${resetInMinutes} minutes or sign in to continue.`,
      resetIn,
    };
  }

  ipLimit.count++;
  return { allowed: true };
}

setInterval(() => {
  const now = Date.now();
  for (const [userId, limit] of requestCounts.entries()) {
    if (now > limit.resetTime) {
      requestCounts.delete(userId);
    }
  }
}, WINDOW_MS);

setInterval(() => {
  const now = Date.now();
  for (const [ip, limit] of ipRequestCounts.entries()) {
    if (now > limit.resetTime) {
      ipRequestCounts.delete(ip);
    }
  }
}, IP_WINDOW_MS);
