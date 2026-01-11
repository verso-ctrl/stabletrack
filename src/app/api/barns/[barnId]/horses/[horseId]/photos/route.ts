// src/app/api/barns/[barnId]/horses/[horseId]/photos/route.ts
// API route for horse photos

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/barns/[barnId]/horses/[horseId]/photos
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string; horseId: string }> }
) {
  try {
    const { barnId, horseId } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:read');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify horse belongs to barn
    const horse = await prisma.horse.findFirst({
      where: { id: horseId, barnId },
    });

    if (!horse) {
      return NextResponse.json({ error: 'Horse not found' }, { status: 404 });
    }

    // Get all photos for this horse
    const photos = await prisma.horsePhoto.findMany({
      where: { horseId },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ 
      photos: photos.map(photo => ({
        id: photo.id,
        url: photo.url,
        storagePath: photo.storagePath,
        fileName: photo.fileName,
        fileSize: photo.fileSize,
        mimeType: photo.mimeType,
        caption: photo.caption,
        category: photo.category,
        isPrimary: photo.isPrimary,
        createdAt: photo.createdAt,
        uploadedAt: photo.uploadedAt,
      }))
    });
  } catch (error) {
    console.error('Get photos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

// POST /api/barns/[barnId]/horses/[horseId]/photos
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string; horseId: string }> }
) {
  try {
    const { barnId, horseId } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { url, fileName, fileSize, mimeType, caption, isPrimary } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // If setting as primary, unset other primaries
    if (isPrimary) {
      await prisma.horsePhoto.updateMany({
        where: { horseId, isPrimary: true },
        data: { isPrimary: false },
      });

      // Also update the horse's profile photo
      await prisma.horse.update({
        where: { id: horseId },
        data: { profilePhotoUrl: url },
      });
    }

    const photo = await prisma.horsePhoto.create({
      data: {
        horseId,
        url,
        fileName,
        fileSize,
        mimeType: mimeType || 'image/jpeg',
        caption,
        isPrimary: isPrimary || false,
        uploadedBy: user.id,
      },
    });

    return NextResponse.json({ photo });
  } catch (error) {
    console.error('Create photo error:', error);
    return NextResponse.json(
      { error: 'Failed to create photo' },
      { status: 500 }
    );
  }
}

// DELETE /api/barns/[barnId]/horses/[horseId]/photos
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string; horseId: string }> }
) {
  try {
    const { barnId, horseId } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('photoId');

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
    }

    const photo = await prisma.horsePhoto.findFirst({
      where: { id: photoId, horseId },
    });

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // If deleting primary photo, clear from horse
    if (photo.isPrimary) {
      await prisma.horse.update({
        where: { id: horseId },
        data: { profilePhotoUrl: null },
      });
    }

    await prisma.horsePhoto.delete({
      where: { id: photoId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete photo error:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}
