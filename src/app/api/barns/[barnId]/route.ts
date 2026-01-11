import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { saveBase64File, deleteFileByPath } from '@/lib/storage-server';
import { randomBytes } from 'crypto';

// GET /api/barns/[barnId] - Get barn details
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

    const hasPermission = await checkBarnPermission(user.id, barnId, 'settings:read');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const barn = await prisma.barn.findUnique({
      where: { id: barnId },
      include: {
        _count: {
          select: {
            horses: true,
            members: true,
          },
        },
      },
    });

    if (!barn) {
      return NextResponse.json({ error: 'Barn not found' }, { status: 404 });
    }

    return NextResponse.json({ data: barn });
  } catch (error) {
    console.error('Error fetching barn:', error);
    return NextResponse.json({ error: 'Failed to fetch barn' }, { status: 500 });
  }
}

// PATCH /api/barns/[barnId] - Update barn settings
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string }> }
) {
  try {
    const { barnId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await checkBarnPermission(user.id, barnId, 'settings:write');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      address,
      city,
      state,
      zipCode,
      country,
      phone,
      email,
      timezone,
      logoBase64,
      logoFilename,
      regenerateInviteCode,
    } = body;

    const updateData: Record<string, unknown> = {};

    // Handle text fields
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zipCode !== undefined) updateData.zipCode = zipCode;
    if (country !== undefined) updateData.country = country;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (timezone !== undefined) updateData.timezone = timezone;

    // Handle logo upload
    if (logoBase64 && logoFilename) {
      const existingBarn = await prisma.barn.findUnique({
        where: { id: barnId },
        select: { logoUrl: true },
      });
      if (existingBarn?.logoUrl) {
        await deleteFileByPath(existingBarn.logoUrl);
      }
      const { fileUrl } = await saveBase64File(logoBase64, 'photos', logoFilename);
      updateData.logoUrl = fileUrl;
    }

    // Regenerate invite code
    if (regenerateInviteCode) {
      updateData.inviteCode = randomBytes(4).toString('hex').toUpperCase();
    }

    const updatedBarn = await prisma.barn.update({
      where: { id: barnId },
      data: updateData,
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        barnId: barnId,
        userId: user.id,
        type: 'SETTINGS_CHANGED',
        description: 'Updated barn settings',
        metadata: JSON.stringify({ updatedFields: Object.keys(updateData) }),
      },
    });

    return NextResponse.json({ data: updatedBarn });
  } catch (error) {
    console.error('Error updating barn:', error);
    return NextResponse.json({ error: 'Failed to update barn' }, { status: 500 });
  }
}

// DELETE /api/barns/[barnId] - Delete barn
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string }> }
) {
  try {
    const { barnId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is the owner
    const membership = await prisma.barnMember.findFirst({
      where: {
        userId: user.id,
        barnId: barnId,
        role: 'OWNER',
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Only the owner can delete the barn' }, { status: 403 });
    }

    // Delete the barn (cascades to all related records)
    await prisma.barn.delete({
      where: { id: barnId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting barn:', error);
    return NextResponse.json({ error: 'Failed to delete barn' }, { status: 500 });
  }
}
