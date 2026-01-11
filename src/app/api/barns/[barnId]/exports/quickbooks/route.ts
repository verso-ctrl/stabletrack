// Stub API for QuickBooks export
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, checkBarnPermission } from '@/lib/auth'

type RouteContext = { params: Promise<{ barnId: string }> }

export async function GET(req: NextRequest, context: RouteContext) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { barnId } = await context.params
  const hasPermission = await checkBarnPermission(user.id, barnId, 'billing:read')
  if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'invoices'
  const format = searchParams.get('format') || 'csv'

  // Generate sample CSV content
  const csvContent = type === 'invoices' 
    ? `Invoice Number,Client,Amount,Status,Date
INV-1001,Sarah Johnson,$1200.00,PAID,${new Date().toISOString().split('T')[0]}
INV-1002,Mike Williams,$1350.00,SENT,${new Date().toISOString().split('T')[0]}`
    : `Client,Email,Balance
Sarah Johnson,sarah@example.com,$0.00
Mike Williams,mike@example.com,$1350.00`;

  if (format === 'csv') {
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="stabletrack-${type}-export.csv"`,
      },
    })
  }

  return NextResponse.json({ 
    data: { 
      message: 'QuickBooks integration available in production',
      exportUrl: null,
    } 
  })
}
