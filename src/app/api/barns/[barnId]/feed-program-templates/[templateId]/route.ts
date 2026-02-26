import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, verifyBarnAccess } from '@/lib/auth';

// DELETE /api/barns/[barnId]/feed-program-templates/[templateId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string; templateId: string }> }
) {
  try {
    const { barnId, templateId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const access = await verifyBarnAccess(user.id, barnId);
    if (!access) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Verify template belongs to this barn
    const template = await prisma.feedProgramTemplate.findFirst({
      where: { id: templateId, barnId },
    });
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    await prisma.feedProgramTemplate.delete({
      where: { id: templateId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feed program template:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
