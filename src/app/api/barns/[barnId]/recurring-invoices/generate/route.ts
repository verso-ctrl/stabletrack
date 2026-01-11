// Stub API for generating recurring invoices
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, checkBarnPermission } from '@/lib/auth'

type RouteContext = { params: Promise<{ barnId: string }> }

export async function POST(req: NextRequest, context: RouteContext) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { barnId } = await context.params
  const hasPermission = await checkBarnPermission(user.id, barnId, 'billing:write')
  if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

  return NextResponse.json({ 
    data: { 
      generated: 0,
      message: 'Recurring invoice generation available in production' 
    } 
  })
}
