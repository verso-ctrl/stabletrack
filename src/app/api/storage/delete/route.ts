// src/app/api/storage/delete/route.ts
// API route for deleting files (Demo mode)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { 
      barnId, 
      fileId, 
      fileType, // 'photo' | 'document'
    } = body

    if (!barnId || !fileId || !fileType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify user has access and permission to delete
    const membership = await prisma.barnMember.findFirst({
      where: {
        barnId,
        userId: user.id,
        role: { in: ['OWNER', 'MANAGER'] },
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Permission denied. Only owners and managers can delete files.' },
        { status: 403 }
      )
    }

    let storagePath: string | null = null
    let fileName: string | null = null

    if (fileType === 'photo') {
      const photo = await prisma.horsePhoto.findUnique({
        where: { id: fileId },
        include: { horse: true },
      })

      if (!photo || photo.horse.barnId !== barnId) {
        return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
      }

      storagePath = photo.storagePath
      fileName = photo.fileName

      // If this was the primary photo, clear it from horse
      if (photo.isPrimary) {
        await prisma.horse.update({
          where: { id: photo.horseId },
          data: { profilePhotoUrl: null },
        })
      }

      // Delete from database
      await prisma.horsePhoto.delete({ where: { id: fileId } })

    } else if (fileType === 'document') {
      const doc = await prisma.document.findUnique({
        where: { id: fileId },
        include: { horse: true },
      })

      if (!doc || doc.horse.barnId !== barnId) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }

      storagePath = doc.storagePath
      fileName = doc.name || doc.fileName

      // Delete from database
      await prisma.document.delete({ where: { id: fileId } })
    }

    // Delete from local filesystem
    if (storagePath && existsSync(storagePath)) {
      try {
        await unlink(storagePath)
      } catch (err) {
        console.error('Failed to delete file from disk:', err)
      }
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        barnId,
        userId: user.id,
        type: fileType === 'photo' ? 'HORSE_UPDATED' : 'HORSE_UPDATED',
        description: `Deleted ${fileType}: ${fileName}`,
        metadata: JSON.stringify({ fileId, fileType }),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete file error:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}
