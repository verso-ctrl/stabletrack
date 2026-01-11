// Stub API for invoice payment link generation
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, checkBarnPermission } from '@/lib/auth'

type RouteContext = { params: Promise<{ barnId: string; invoiceId: string }> }

export async function GET(req: NextRequest, context: RouteContext) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { barnId, invoiceId } = await context.params
  const hasPermission = await checkBarnPermission(user.id, barnId, 'billing:read')
  if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

  return NextResponse.json({ 
    data: { 
      url: `https://pay.stripe.com/demo/${invoiceId}`,
      message: 'Stripe integration available in production' 
    } 
  })
}

export async function POST(req: NextRequest, context: RouteContext) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { barnId, invoiceId } = await context.params
  const hasPermission = await checkBarnPermission(user.id, barnId, 'billing:write')
  if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

  return NextResponse.json({ 
    data: { 
      url: `https://pay.stripe.com/demo/${invoiceId}`,
      message: 'Payment link created (demo mode)' 
    } 
  })
}
