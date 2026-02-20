// Next.js instrumentation - runs once at server startup
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  // Validate environment variables at startup
  const { validateEnv } = await import('@/lib/env');
  validateEnv();
}
