// src/app/api/storage/upload/route.ts
// API route for file uploads (stores as base64 in database)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import {
  getTierFeatures,
  getTierLimits,
  hasReachedPhotoLimit,
  getTierDisplayName,
  getNextTier,
  normalizeTier,
} from '@/lib/tiers'
import { checkRateLimit, getRateLimitIdentifier, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting - 10 uploads per minute
    const rateLimitResult = checkRateLimit(
      getRateLimitIdentifier(req, user.id),
      RATE_LIMITS.upload
    )

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    let formData: FormData
    try {
      formData = await req.formData()
    } catch (parseError) {
      console.error('FormData parse error:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse upload. File may be too large (max 10MB).' },
        { status: 413 }
      )
    }

    const file = formData.get('file') as File
    const barnId = formData.get('barnId') as string
    const horseId = formData.get('horseId') as string
    const type = formData.get('type') as string // 'photo' | 'document'
    const isPrimary = formData.get('isPrimary') === 'true'
    const caption = formData.get('caption') as string | null
    const documentType = formData.get('documentType') as string | null
    const documentTitle = formData.get('documentTitle') as string | null
    const documentNotes = formData.get('documentNotes') as string | null

    if (!file || !barnId || !horseId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate file type to prevent stored XSS
    const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
    const ALLOWED_DOCUMENT_TYPES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv',
      ...ALLOWED_PHOTO_TYPES,
    ]
    const allowedTypes = type === 'photo' ? ALLOWED_PHOTO_TYPES : ALLOWED_DOCUMENT_TYPES
    if (!file.type || !allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type "${file.type || 'unknown'}" is not allowed. Accepted: ${type === 'photo' ? 'JPEG, PNG, GIF, WebP' : 'PDF, Word, Excel, CSV, images'}` },
        { status: 400 }
      )
    }

    // Guard against files too large for base64 DB storage
    const maxSize = 25 * 1024 * 1024 // 25MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum is 25MB.` },
        { status: 413 }
      )
    }

    console.log(`Upload: ${file.name} (${file.size} bytes, ${file.type || 'unknown type'}) for horse ${horseId}`)

    // Verify user has access and get barn tier
    const membership = await prisma.barnMember.findFirst({
      where: {
        barnId,
        userId: user.id,
        role: { in: ['OWNER', 'MANAGER', 'CARETAKER'] },
      },
      include: {
        barn: {
          select: {
            tier: true,
          },
        },
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Get tier from barn
    const tier = normalizeTier(membership.barn.tier)
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
        return NextResponse.json({
          error: `Photo limit reached (${limits.maxPhotosPerHorse} photos per horse on ${getTierDisplayName(tier)} plan)`,
          code: 'PHOTO_LIMIT_REACHED',
          limit: limits.maxPhotosPerHorse,
          current: photoCount,
          upgrade: getNextTier(tier),
        }, { status: 403 })
      }
    }

    // Convert file to base64 for database storage
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')

    // Create database record with file data
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
          url: `/api/storage/file/photo/${horseId}`, // Placeholder URL, will use photo ID
          fileData: base64Data,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          caption,
          isPrimary,
          uploadedBy: user.id,
        },
      })

      // Update URL with actual photo ID
      const fileUrl = `/api/storage/file/photo/${photo.id}`
      await prisma.horsePhoto.update({
        where: { id: photo.id },
        data: { url: fileUrl },
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
        photo: { ...photo, url: fileUrl },
        url: fileUrl,
      })
    } else {
      const document = await prisma.document.create({
        data: {
          horseId,
          type: documentType || 'other',
          title: documentTitle || file.name,
          name: file.name,
          fileName: file.name,
          url: `/api/storage/file/document/${horseId}`, // Placeholder
          fileUrl: `/api/storage/file/document/${horseId}`, // Placeholder
          fileData: base64Data,
          fileSize: file.size,
          mimeType: file.type,
          notes: documentNotes || null,
          uploadedBy: user.id,
        },
      })

      // Update URL with actual document ID
      const fileUrl = `/api/storage/file/document/${document.id}`
      await prisma.document.update({
        where: { id: document.id },
        data: {
          url: fileUrl,
          fileUrl: fileUrl,
        },
      })

      return NextResponse.json({
        success: true,
        document: { ...document, url: fileUrl, fileUrl },
        url: fileUrl,
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Upload error:', message, error)
    return NextResponse.json(
      { error: `Upload failed: ${message}` },
      { status: 500 }
    )
  }
}
