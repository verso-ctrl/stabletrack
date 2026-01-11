import { rateLimit, ValidationError } from '../api-helpers';
import { formatValidationErrors } from '../validations';

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear rate limit cache between tests
    // Note: In production tests, you'd want to inject the cache
  });

  it('should allow requests within limit', () => {
    const result1 = rateLimit('test-user', 5, 60000);
    expect(result1.success).toBe(true);
    expect(result1.remaining).toBe(4);

    const result2 = rateLimit('test-user', 5, 60000);
    expect(result2.success).toBe(true);
    expect(result2.remaining).toBe(3);
  });

  it('should block requests after limit', () => {
    // Make 5 requests (limit = 5)
    for (let i = 0; i < 5; i++) {
      rateLimit('test-user-2', 5, 60000);
    }

    // 6th request should be blocked
    const result = rateLimit('test-user-2', 5, 60000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should track different users separately', () => {
    const user1 = rateLimit('user-1', 5, 60000);
    const user2 = rateLimit('user-2', 5, 60000);

    expect(user1.success).toBe(true);
    expect(user2.success).toBe(true);
    expect(user1.remaining).toBe(4);
    expect(user2.remaining).toBe(4);
  });

  it('should reset after window expires', async () => {
    // Make request with 100ms window
    const result1 = rateLimit('test-user-3', 2, 100);
    expect(result1.success).toBe(true);

    const result2 = rateLimit('test-user-3', 2, 100);
    expect(result2.success).toBe(true);

    // Should be at limit
    const result3 = rateLimit('test-user-3', 2, 100);
    expect(result3.success).toBe(false);

    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 150));

    // Should be allowed again
    const result4 = rateLimit('test-user-3', 2, 100);
    expect(result4.success).toBe(true);
  });

  it('should handle high limits correctly', () => {
    const result = rateLimit('test-user-4', 1000, 60000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(999);
  });

  it('should handle low limits correctly', () => {
    const result1 = rateLimit('test-user-5', 1, 60000);
    expect(result1.success).toBe(true);
    expect(result1.remaining).toBe(0);

    const result2 = rateLimit('test-user-5', 1, 60000);
    expect(result2.success).toBe(false);
    expect(result2.remaining).toBe(0);
  });
});

describe('ValidationError', () => {
  it('should create validation error with details', () => {
    const errors = {
      email: 'Invalid email',
      password: 'Password too short',
    };

    const error = new ValidationError('Validation failed', errors);

    expect(error.message).toBe('Validation failed');
    expect(error.name).toBe('ValidationError');
    expect(error.errors).toEqual(errors);
  });

  it('should be instance of Error', () => {
    const error = new ValidationError('Test', {});
    expect(error instanceof Error).toBe(true);
    expect(error instanceof ValidationError).toBe(true);
  });
});
