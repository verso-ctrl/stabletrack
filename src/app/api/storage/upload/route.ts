// src/app/api/storage/upload/route.ts
// API route for file uploads (Demo mode - uses local storage)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { 
  getTierFeatures,
  getTierLimits,
  hasReachedPhotoLimit,
  getTierDisplayName,
  getNextTier,
  formatBytes,
  normalizeTier,
  type SubscriptionTier
} from '@/lib/tiers'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const barnId = formData.get('barnId') as string
    const horseId = formData.get('horseId') as string
    const type = formData.get('type') as string // 'photo' | 'document'
    const isPrimary = formData.get('isPrimary') === 'true'
    const caption = formData.get('caption') as string | null
    const documentType = formData.get('documentType') as string | null

    if (!file || !barnId || !horseId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify user has access
    const membership = await prisma.barnMember.findFirst({
      where: {
        barnId,
        userId: user.id,
        role: { in: ['OWNER', 'MANAGER', 'CARETAKER'] },
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Demo mode: Always FARM tier
    const tier: SubscriptionTier = 'FARM'
    const features = getTierFeatures(tier)
    const limits = getTierLimits(tier)

    // Check permissions
    if (type === 'photo' && !features.canUploadPhotos) {
      return NextResponse.json({
        error: 'Photo uploads not available on your plan',
        code: 'FEATURE_NOT_AVAILABLE',
      }, { status: 403 })
    }

    if (type === 'document' && !features.canUploadDocuments) {
      return NextResponse.json({
        error: 'Document uploads not available on your plan',
        code: 'FEATURE_NOT_AVAILABLE',
      }, { status: 403 })
    }

    // Check photo limit
    if (type === 'photo') {
      const photoCount = await prisma.horsePhoto.count({
        where: { horseId },
      })

      if (hasReachedPhotoLimit(tier, photoCount)) {
        const nextTier = getNextTier(tier)
        return NextResponse.json({
          error: `Photo limit reached (${limits.maxPhotosPerHorse} photos per horse on ${getTierDisplayName(tier)} plan)`,
          code: 'PHOTO_LIMIT_REACHED',
          limit: limits.maxPhotosPerHorse,
          current: photoCount,
          upgrade: nextTier ? {
            tier: nextTier,
            tierName: getTierDisplayName(nextTier),
            newLimit: getTierLimits(nextTier).maxPhotosPerHorse,
          } : null,
        }, { status: 403 })
      }
    }

    // Save file to local uploads directory
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const uploadDir = join(process.cwd(), 'uploads', type === 'photo' ? 'photos' : 'documents')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const filePath = join(uploadDir, fileName)
    await writeFile(filePath, buffer)
    
    const fileUrl = `/api/uploads/${type === 'photo' ? 'photos' : 'documents'}/${fileName}`

    // Create database record
    if (type === 'photo') {
      // If setting as primary, unset other primaries first
      if (isPrimary) {
        await prisma.horsePhoto.updateMany({
          where: { horseId, isPrimary: true },
          data: { isPrimary: false },
        })
      }

      const photo = await prisma.horsePhoto.create({
        data: {
          horseId,
          url: fileUrl,
          storagePath: filePath,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          caption,
          isPrimary,
          uploadedBy: user.id,
        },
      })

      // Update horse profile photo if primary
      if (isPrimary) {
        await prisma.horse.update({
          where: { id: horseId },
          data: { profilePhotoUrl: fileUrl },
        })
      }

      return NextResponse.json({
        success: true,
        photo,
        url: fileUrl,
      })
    } else {
      const document = await prisma.document.create({
        data: {
          horseId,
          type: documentType || 'other',
          title: file.name,
          name: file.name,
          fileName: file.name,
          url: fileUrl,
          fileUrl: fileUrl,
          storagePath: filePath,
          fileSize: file.size,
          mimeType: file.type,
          uploadedBy: user.id,
        },
      })

      return NextResponse.json({
        success: true,
        document,
        url: fileUrl,
      })
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
