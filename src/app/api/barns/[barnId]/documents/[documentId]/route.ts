import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteFileByPath } from '@/lib/storage-server';

// DELETE /api/barns/[barnId]/documents/[documentId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string; documentId: string }> }
) {
  try {
    const { barnId, documentId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find document and verify it belongs to this barn
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        horse: { barnId },
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete the file from storage
    if (document.fileUrl) {
      await deleteFileByPath(document.fileUrl);
    }

    // Delete the database record
    await prisma.document.delete({
      where: { id: documentId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        barnId,
        userId: user.id,
        type: 'DOCUMENT_DELETED',
        description: `Deleted document ${document.title}`,
        metadata: JSON.stringify({ documentId }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
