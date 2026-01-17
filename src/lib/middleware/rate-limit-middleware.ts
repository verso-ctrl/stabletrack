// Rate limiting middleware for API routes
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getRateLimitIdentifier, rateLimitResponse, RATE_LIMITS, type RateLimitConfig } from '@/lib/rate-limit'

export function withRateLimit(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>,
  config: RateLimitConfig = RATE_LIMITS.api
) {
  return async (req: NextRequest, ...args: any[]) => {
    // Get identifier (user ID or IP)
    const identifier = getRateLimitIdentifier(req)

    // Check rate limit
    const result = checkRateLimit(identifier, config)

    if (!result.success) {
      return rateLimitResponse(result)
    }

    // Add rate limit headers to response
    const response = await handler(req, ...args)

    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', result.resetIn.toString())

    return response
  }
}
