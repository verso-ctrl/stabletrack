import { NextResponse } from 'next/server';
import { z } from 'zod';
import { formatValidationErrors } from './validations';
import { captureException } from './sentry';

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
        error: error.message || 'Internal server error',
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
