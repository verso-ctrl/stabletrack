// Stub API for Google Calendar integration
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, checkBarnPermission } from '@/lib/auth'

type RouteContext = { params: Promise<{ barnId: string }> }

export async function GET(req: NextRequest, context: RouteContext) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { barnId } = await context.params
  const hasPermission = await checkBarnPermission(user.id, barnId, 'calendar:read')
  if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

  // Return integration status
  return NextResponse.json({ 
    data: { 
      connected: false,
      message: 'Google Calendar integration available in production',
      setupUrl: null,
    } 
  })
}

export async function POST(req: NextRequest, context: RouteContext) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { barnId } = await context.params
  const hasPermission = await checkBarnPermission(user.id, barnId, 'calendar:write')
  if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

  return NextResponse.json({ 
    data: { 
      message: 'Google Calendar sync triggered (demo mode)',
      synced: 0,
    } 
  })
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { barnId } = await context.params
  const hasPermission = await checkBarnPermission(user.id, barnId, 'calendar:write')
  if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

  return NextResponse.json({ success: true, message: 'Google Calendar disconnected' })
}
