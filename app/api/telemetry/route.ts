import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple IP-based rate limiter for telemetry endpoint
 * Max 10 requests per IP per minute to prevent spam
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 1000; // 1 minute

function checkIPRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }

  if (limit.count >= RATE_LIMIT) {
    return false;
  }

  limit.count++;
  return true;
}

// Cleanup expired entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [ip, limit] of rateLimitMap.entries()) {
    if (now > limit.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, WINDOW_MS);

/**
 * Telemetry API endpoint for server-side event logging
 * 
 * This endpoint accepts telemetry events and logs them server-side so they can be
 * monitored centrally through workflow logs (stdout). This is useful for tracking
 * deprecated features and understanding when it's safe to remove them.
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP address from headers
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
              request.headers.get('x-real-ip') || 
              'unknown';
    
    // Check rate limit
    if (!checkIPRateLimit(ip)) {
      console.log('[TELEMETRY RATE LIMIT]', { ip, timestamp: new Date().toISOString() });
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { eventName, userId, metadata } = body;

    // Validate required fields
    if (!eventName) {
      return NextResponse.json(
        { error: 'eventName is required' },
        { status: 400 }
      );
    }

    // Log telemetry event to server console (captured in workflow logs)
    const timestamp = new Date().toISOString();
    console.log('[TELEMETRY]', JSON.stringify({
      timestamp,
      eventName,
      userId: userId || 'unauthenticated',
      metadata: metadata || {},
      ip, // Include IP for spam detection
    }));

    // Return success immediately
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[TELEMETRY ERROR]', error.message);
    // Still return 200 to not block client-side operations
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
