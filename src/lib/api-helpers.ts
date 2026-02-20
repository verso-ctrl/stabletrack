import { NextResponse } from 'next/server';
import { z } from 'zod';
import { formatValidationErrors } from './validations';
import { captureException } from './sentry';
import crypto from 'crypto';

/**
 * Validates request body against a Zod schema
 * Returns validated data or throws an error with formatted validation messages
 */
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = formatValidationErrors(error);
      throw new ValidationError('Validation failed', errors);
    }
    throw error;
  }
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Record<string, string>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Error handler middleware for API routes
 * Catches errors and returns appropriate JSON responses
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.errors,
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    // Log to Sentry
    captureException(error);

    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
    },
    { status: 500 }
  );
}

/**
 * Rate limiting helper
 * Simple in-memory rate limiter - for production use Redis/Upstash
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): { success: boolean; remaining: number } {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    requestCounts.forEach((value, key) => {
      if (value.resetAt < now) {
        requestCounts.delete(key);
      }
    });
  }

  // Initialize or reset if window expired
  if (!record || record.resetAt < now) {
    requestCounts.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { success: true, remaining: limit - 1 };
  }

  // Increment and check
  record.count++;
  const remaining = Math.max(0, limit - record.count);

  if (record.count > limit) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining };
}

/**
 * Get client identifier for rate limiting
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

/**
 * Async error wrapper for API route handlers
 * Automatically catches and handles errors
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

// ============================================================================
// Pagination Helpers
// ============================================================================

/**
 * Parse and bound pagination parameters from URL search params
 * Prevents unbounded queries from client input
 */
export function parsePagination(
  searchParams: URLSearchParams,
  defaults: { page?: number; limit?: number; maxLimit?: number } = {}
): { page: number; limit: number; skip: number } {
  const { page: defaultPage = 1, limit: defaultLimit = 50, maxLimit = 200 } = defaults;

  let page = parseInt(searchParams.get('page') || String(defaultPage));
  if (isNaN(page) || page < 1) page = 1;

  const limitParam = searchParams.get('limit') || searchParams.get('pageSize');
  let limit = parseInt(limitParam || String(defaultLimit));
  if (isNaN(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  return { page, limit, skip: (page - 1) * limit };
}

// ============================================================================
// ETag and Cached Response Helpers
// ============================================================================

/**
 * Generate an ETag from data
 * Uses MD5 hash of JSON stringified data for fast hashing
 */
export function generateETag(data: unknown): string {
  const content = JSON.stringify(data);
  const hash = crypto.createHash('md5').update(content).digest('hex');
  return `"${hash}"`;
}

/**
 * Generate a weak ETag (for use when data may be semantically equivalent)
 */
export function generateWeakETag(data: unknown): string {
  const content = JSON.stringify(data);
  const hash = crypto.createHash('md5').update(content).digest('hex');
  return `W/"${hash}"`;
}

interface CachedResponseOptions {
  /** Cache max-age in seconds (default: 60) */
  maxAge?: number;
  /** Use private caching (default: true for authenticated endpoints) */
  isPrivate?: boolean;
  /** Stale-while-revalidate duration in seconds */
  staleWhileRevalidate?: number;
  /** Use weak ETag instead of strong (default: false) */
  weakETag?: boolean;
}

/**
 * Create a cached JSON response with ETag support
 * Automatically returns 304 Not Modified if client has current version
 */
export function createCachedResponse(
  data: unknown,
  request: Request,
  options: CachedResponseOptions = {}
): NextResponse {
  const {
    maxAge = 60,
    isPrivate = true,
    staleWhileRevalidate = 300,
    weakETag = false,
  } = options;

  // Generate ETag for the data
  const etag = weakETag ? generateWeakETag(data) : generateETag(data);

  // Check if client has current version
  const ifNoneMatch = request.headers.get('if-none-match');
  if (ifNoneMatch) {
    // Handle multiple ETags in if-none-match header
    const clientETags = ifNoneMatch.split(',').map(tag => tag.trim());
    if (clientETags.includes(etag) || clientETags.includes('*')) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': etag,
          'Cache-Control': buildCacheControl(isPrivate, maxAge, staleWhileRevalidate),
        },
      });
    }
  }

  // Return full response with cache headers
  return NextResponse.json(data, {
    headers: {
      'ETag': etag,
      'Cache-Control': buildCacheControl(isPrivate, maxAge, staleWhileRevalidate),
      'Vary': 'Authorization, Cookie',
    },
  });
}

/**
 * Build Cache-Control header value
 */
function buildCacheControl(
  isPrivate: boolean,
  maxAge: number,
  staleWhileRevalidate?: number
): string {
  const parts = [isPrivate ? 'private' : 'public', `max-age=${maxAge}`];

  if (staleWhileRevalidate) {
    parts.push(`stale-while-revalidate=${staleWhileRevalidate}`);
  }

  return parts.join(', ');
}

/**
 * Create a response that should never be cached
 */
export function createNoCacheResponse(data: unknown): NextResponse {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    },
  });
}
