import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { saveBase64File, deleteFileByPath } from '@/lib/storage-server';

// GET /api/user - Get current user profile
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        subscription: true,
      },
    });

    return NextResponse.json({ data: fullUser });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PATCH /api/user - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      timezone,
      avatarBase64,
      avatarFilename,
      emailNotifications,
      smsNotifications,
    } = body;

    const updateData: Record<string, unknown> = {};

    // Handle text fields
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
    if (smsNotifications !== undefined) updateData.smsNotifications = smsNotifications;

    // Handle avatar upload
    if (avatarBase64 && avatarFilename) {
      // Delete old avatar if exists
      const existingUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { avatarUrl: true },
      });
      if (existingUser?.avatarUrl) {
        await deleteFileByPath(existingUser.avatarUrl);
      }

      // Save new avatar
      const { fileUrl } = await saveBase64File(avatarBase64, 'photos', avatarFilename);
      updateData.avatarUrl = fileUrl;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({ data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
