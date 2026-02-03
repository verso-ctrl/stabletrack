import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Health check endpoint for load balancers and monitoring
 * GET /api/health
 */
export async function GET() {
  const health: {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    checks: {
      database: 'connected' | 'disconnected';
      uptime: number;
    };
    version?: string;
  } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'disconnected',
      uptime: process.uptime(),
    },
  };

  // Check database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = 'connected';
  } catch (error) {
    health.checks.database = 'disconnected';
    health.status = 'unhealthy';
    console.error('Health check: Database connection failed', error);
  }

  // Add version if available
  if (process.env.npm_package_version) {
    health.version = process.env.npm_package_version;
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
