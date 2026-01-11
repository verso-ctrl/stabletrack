import { setCsrfCookie } from '@/lib/csrf';
import { NextResponse } from 'next/server';

export async function GET() {
  const token = await setCsrfCookie();
  return NextResponse.json({ csrfToken: token });
}
