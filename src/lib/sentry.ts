/**
 * Error Tracking (Sentry removed for production build compatibility)
 *
 * These are stub functions that log to console.
 * To re-enable Sentry, install @sentry/nextjs and update these functions.
 */

export function initSentry() {
  console.log('Error tracking: Console logging only (Sentry disabled)');
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error, context?: Record<string, any>) {
  console.error('Error captured:', error, context);
}

/**
 * Capture a message for logging
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  const upperLevel = level.toUpperCase();
  console.log(`[${upperLevel}] ${message}`);
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; name?: string } | null) {
  // No-op when Sentry is disabled
  if (user) {
    console.log('User context set:', user.id);
  }
}
