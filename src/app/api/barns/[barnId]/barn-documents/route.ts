import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, checkBarnPermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getRateLimitIdentifier, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'

type RouteContext = { params: Promise<{ barnId: string }> }

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { barnId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:read')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const docs = await prisma.barnDocument.findMany({
      where: { barnId },
      orderBy: { uploadedAt: 'desc' },
    })

    return NextResponse.json({ data: docs })
  } catch (error) {
    console.error('Error fetching barn documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { barnId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const rateLimitResult = checkRateLimit(getRateLimitIdentifier(req, user.id), RATE_LIMITS.upload)
    if (!rateLimitResult.success) return rateLimitResponse(rateLimitResult)

    let formData: FormData
    try {
      formData = await req.formData()
    } catch {
      return NextResponse.json({ error: 'Failed to parse upload. File may be too large.' }, { status: 413 })
    }

    const file = formData.get('file') as File
    const title = (formData.get('title') as string)?.trim()
    const tag = (formData.get('tag') as string)?.trim() || 'Other'
    const notes = (formData.get('notes') as string)?.trim() || null

    if (!file || !title) {
      return NextResponse.json({ error: 'File and title are required' }, { status: 400 })
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum is 25MB.' }, { status: 413 })
    }

    const bytes = await file.arrayBuffer()
    const base64Data = Buffer.from(bytes).toString('base64')
    const mimeType = file.type || 'application/octet-stream'

    const doc = await prisma.barnDocument.create({
      data: {
        barnId,
        title,
        type: tag,
        fileName: file.name,
        fileUrl: '', // placeholder, updated below
        fileSize: file.size,
        mimeType,
        notes,
        uploadedBy: user.id,
      },
    })

    // Store base64 inline and set fileUrl to the retrieval endpoint
    const fileUrl = `/api/storage/file/barn-document/${doc.id}`
    await prisma.barnDocument.update({
      where: { id: doc.id },
      data: { fileUrl, storagePath: base64Data },
    })

    return NextResponse.json({ data: { ...doc, fileUrl } }, { status: 201 })
  } catch (error) {
    console.error('Error uploading barn document:', error)
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
  }
}
