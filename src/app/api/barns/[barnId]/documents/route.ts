import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission, getClientAccess } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { saveBase64File } from '@/lib/storage-server';

// GET /api/barns/[barnId]/documents - Get all documents for barn
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string }> }
) {
  try {
    const { barnId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await checkBarnPermission(user.id, barnId, 'documents:read');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const horseId = searchParams.get('horseId');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    // Check if user is a client (to filter to their horses only)
    const clientAccess = await getClientAccess(user.id, barnId);
    const isClient = !!clientAccess && !await prisma.barnMember.findUnique({
      where: { userId_barnId: { userId: user.id, barnId } },
    });
    
    // Get client's horse IDs if client
    const clientHorseIds = isClient && clientAccess 
      ? clientAccess.horses.map((h: { horseId: string }) => h.horseId)
      : null;

    const documents = await prisma.document.findMany({
      where: {
        horse: { barnId: barnId },
        ...(horseId && { horseId }),
        ...(type && { type }),
        ...(search && {
          OR: [
            { title: { contains: search } },
            { fileName: { contains: search } },
          ],
        }),
        // If client, only show their horses' documents
        ...(clientHorseIds && { horseId: { in: clientHorseIds } }),
      },
      include: {
        horse: {
          select: { id: true, barnName: true },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json({ data: documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

// POST /api/barns/[barnId]/documents - Create a document with file upload
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string }> }
) {
  try {
    const { barnId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      horseId,
      type,
      title,
      fileName,
      fileBase64,
      expiryDate,
      notes,
    } = body;

    if (!horseId || !title || !fileName || !fileBase64) {
      return NextResponse.json(
        { error: 'Horse ID, title, file name, and file are required' },
        { status: 400 }
      );
    }

    // Verify horse belongs to barn
    const horse = await prisma.horse.findFirst({
      where: { id: horseId, barnId: barnId },
    });

    if (!horse) {
      return NextResponse.json({ error: 'Horse not found' }, { status: 404 });
    }

    // Save the file
    const { fileUrl, fileSize } = await saveBase64File(fileBase64, 'documents', fileName);
    
    // Get mime type from filename
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
    };
    const mimeType = mimeTypes[ext || ''] || 'application/octet-stream';

    const document = await prisma.document.create({
      data: {
        horseId,
        type: type || 'OTHER',
        title,
        fileName,
        fileUrl,
        fileSize,
        mimeType,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        notes,
        uploadedBy: user.id,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        barnId: barnId,
        userId: user.id,
        type: 'DOCUMENT_UPLOADED',
        description: `Uploaded ${title} for ${horse.barnName}`,
        metadata: JSON.stringify({ documentId: document.id, horseId }),
      },
    });

    return NextResponse.json({ data: document }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
