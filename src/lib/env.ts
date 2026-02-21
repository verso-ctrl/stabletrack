// Environment variable validation
// Checks required vars at import time and provides typed access

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Check your .env file or deployment environment.`
    );
  }
  return value;
}

function getOptionalEnv(name: string, defaultValue: string = ''): string {
  return process.env[name] || defaultValue;
}

/**
 * Validate that all critical environment variables are set.
 * Call this at app startup to fail fast with clear error messages.
 */
export function validateEnv() {
  const errors: string[] = [];

  // Database is always required
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  }

  // Check for Clerk configuration (required in production)
  const isProduction = process.env.NODE_ENV === 'production';
  const demoDisabled = process.env.DISABLE_DEMO_MODE === 'true';

  if (isProduction || demoDisabled) {
    if (!process.env.CLERK_SECRET_KEY) {
      errors.push('CLERK_SECRET_KEY is required in production');
    }
    if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      errors.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required in production');
    }
  }

  // Stripe (required for payment features)
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_WEBHOOK_SECRET) {
    errors.push('STRIPE_WEBHOOK_SECRET is required when STRIPE_SECRET_KEY is set');
  }

  // Check for common misconfigurations
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (isProduction && appUrl && appUrl.includes('localhost')) {
    errors.push(
      `NEXT_PUBLIC_APP_URL is set to "${appUrl}" which contains localhost. ` +
      `This should be your production domain in production.`
    );
  }

  // Check for NEXT_PUBLIC_ vars that might contain secrets
  // Whitelist: Supabase anon keys are JWTs by design and are safe to expose
  const safePublicVars = new Set([
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_SENTRY_DSN',
  ]);

  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('NEXT_PUBLIC_') && value && value.length > 100 && !safePublicVars.has(key)) {
      if (value.startsWith('eyJ') || value.includes('sk_')) {
        errors.push(
          `${key} appears to contain a secret key or JWT. ` +
          `NEXT_PUBLIC_ variables are exposed to the client.`
        );
      }
    }
  }

  if (errors.length > 0) {
    const message = [
      '=== Environment Configuration Errors ===',
      ...errors.map((e, i) => `  ${i + 1}. ${e}`),
      '========================================',
    ].join('\n');

    console.error(message);
  }
}

// Export typed env accessors for common vars
export const env = {
  get DATABASE_URL() { return getRequiredEnv('DATABASE_URL'); },
  get APP_URL() { return getOptionalEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'); },
  get STRIPE_SECRET_KEY() { return getOptionalEnv('STRIPE_SECRET_KEY'); },
  get STRIPE_WEBHOOK_SECRET() { return getOptionalEnv('STRIPE_WEBHOOK_SECRET'); },
  get CLERK_SECRET_KEY() { return getOptionalEnv('CLERK_SECRET_KEY'); },
  get NODE_ENV() { return getOptionalEnv('NODE_ENV', 'development'); },
  get isProduction() { return process.env.NODE_ENV === 'production'; },
};
