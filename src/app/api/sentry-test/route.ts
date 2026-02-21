import { NextResponse } from 'next/server';

export function GET() {
  throw new Error('Sentry test error — this is intentional');
  return NextResponse.json({ ok: true });
}
