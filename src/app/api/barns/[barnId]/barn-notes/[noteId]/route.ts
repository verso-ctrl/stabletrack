import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, checkBarnPermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ barnId: string; noteId: string }> }

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { barnId, noteId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const note = await prisma.barnNote.findUnique({ where: { id: noteId, barnId } })
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })

    const body = await req.json()
    const content = body.content?.trim()
    if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 })

    const updated = await prisma.barnNote.update({
      where: { id: noteId },
      data: { content },
      include: { author: { select: { firstName: true, lastName: true } } },
    })

    return NextResponse.json({
      data: {
        id: updated.id,
        content: updated.content,
        isPinned: updated.isPinned,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        authorName: [updated.author.firstName, updated.author.lastName].filter(Boolean).join(' ') || 'Unknown',
      },
    })
  } catch (error) {
    console.error('Error updating barn note:', error)
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { barnId, noteId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const note = await prisma.barnNote.findUnique({ where: { id: noteId, barnId } })
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })

    await prisma.barnNote.delete({ where: { id: noteId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting barn note:', error)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}
