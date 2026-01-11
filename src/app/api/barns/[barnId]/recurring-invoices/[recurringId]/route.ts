// Stub API for individual recurring invoice
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, checkBarnPermission } from '@/lib/auth'

type RouteContext = { params: Promise<{ barnId: string; recurringId: string }> }

export async function PUT(req: NextRequest, context: RouteContext) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { barnId, recurringId } = await context.params
  const hasPermission = await checkBarnPermission(user.id, barnId, 'billing:write')
  if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

  const body = await req.json()
  return NextResponse.json({ data: { id: recurringId, ...body, updatedAt: new Date().toISOString() } })
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { barnId } = await context.params
  const hasPermission = await checkBarnPermission(user.id, barnId, 'billing:write')
  if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

  return NextResponse.json({ success: true })
}
