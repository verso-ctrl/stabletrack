import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, checkBarnPermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ barnId: string; horseId: string }> }

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { barnId, horseId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:read')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const horse = await prisma.horse.findUnique({ where: { id: horseId, barnId }, select: { id: true } })
    if (!horse) return NextResponse.json({ error: 'Horse not found' }, { status: 404 })

    const notes = await prisma.note.findMany({
      where: { horseId },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { firstName: true, lastName: true } } },
    })

    return NextResponse.json({
      data: notes.map(n => ({
        id: n.id,
        content: n.content,
        isPinned: n.isPinned,
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
        authorName: [n.author.firstName, n.author.lastName].filter(Boolean).join(' ') || 'Unknown',
      })),
    })
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { barnId, horseId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const horse = await prisma.horse.findUnique({ where: { id: horseId, barnId }, select: { id: true } })
    if (!horse) return NextResponse.json({ error: 'Horse not found' }, { status: 404 })

    const body = await req.json()
    const content = body.content?.trim()
    if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 })

    const note = await prisma.note.create({
      data: { horseId, content, createdBy: user.id },
      include: { author: { select: { firstName: true, lastName: true } } },
    })

    return NextResponse.json({
      data: {
        id: note.id,
        content: note.content,
        isPinned: note.isPinned,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        authorName: [note.author.firstName, note.author.lastName].filter(Boolean).join(' ') || 'Unknown',
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}
