import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, checkBarnPermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ barnId: string; documentId: string }> }

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { barnId, documentId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const doc = await prisma.barnDocument.findUnique({ where: { id: documentId, barnId } })
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

    const body = await req.json()
    const updated = await prisma.barnDocument.update({
      where: { id: documentId },
      data: {
        title: body.title?.trim() || doc.title,
        type: body.type?.trim() || doc.type,
        notes: body.notes !== undefined ? body.notes : doc.notes,
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Error updating barn document:', error)
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { barnId, documentId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const doc = await prisma.barnDocument.findUnique({ where: { id: documentId, barnId } })
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

    await prisma.barnDocument.delete({ where: { id: documentId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting barn document:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
