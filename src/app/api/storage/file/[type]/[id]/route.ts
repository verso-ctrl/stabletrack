// API route to serve files stored in database
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, id } = await params

    let fileData: string | null = null
    let mimeType: string | null = null
    let fileName: string | null = null

    if (type === 'photo') {
      const photo = await prisma.horsePhoto.findUnique({
        where: { id },
        select: {
          fileData: true,
          mimeType: true,
          fileName: true,
        },
      })

      if (!photo || !photo.fileData) {
        return NextResponse.json(
          { error: 'Photo not found' },
          { status: 404 }
        )
      }

      fileData = photo.fileData
      mimeType = photo.mimeType || 'image/jpeg'
      fileName = photo.fileName || 'photo.jpg'
    } else if (type === 'document') {
      const document = await prisma.document.findUnique({
        where: { id },
        select: {
          fileData: true,
          mimeType: true,
          fileName: true,
        },
      })

      if (!document || !document.fileData) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        )
      }

      fileData = document.fileData
      mimeType = document.mimeType || 'application/octet-stream'
      fileName = document.fileName || 'document'
    } else {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      )
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(fileData, 'base64')

    // Return file with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    )
  }
}
