import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/barns/join - Join a barn with invite code
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { inviteCode } = await request.json();
    
    if (!inviteCode) {
      return NextResponse.json(
        { error: 'Invite code is required' },
        { status: 400 }
      );
    }
    
    // Find barn by invite code
    const barn = await prisma.barn.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
    });
    
    if (!barn) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 404 }
      );
    }
    
    // Check if user is already a member
    const existingMembership = await prisma.barnMember.findUnique({
      where: {
        userId_barnId: {
          userId: user.id,
          barnId: barn.id,
        },
      },
    });
    
    if (existingMembership) {
      if (existingMembership.status === 'PENDING') {
        return NextResponse.json(
          { error: 'Your request to join this barn is pending approval' },
          { status: 400 }
        );
      }
      if (existingMembership.status === 'REJECTED') {
        return NextResponse.json(
          { error: 'Your request to join this barn was declined' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'You are already a member of this barn' },
        { status: 400 }
      );
    }
    
    // Create membership with PENDING status
    const membership = await prisma.barnMember.create({
      data: {
        userId: user.id,
        barnId: barn.id,
        role: 'CARETAKER', // Default role, owner can change when approving
        status: 'PENDING',
      },
      include: {
        barn: true,
      },
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'MEMBER_JOIN_REQUESTED',
        description: `${user.firstName || user.email} requested to join the barn`,
        userId: user.id,
        barnId: barn.id,
      },
    });
    
    return NextResponse.json({
      data: {
        barnName: membership.barn.name,
        status: 'PENDING',
        message: 'Your request to join has been submitted. The barn owner will review your request.',
      },
    });
  } catch (error) {
    console.error('Error joining barn:', error);
    return NextResponse.json(
      { error: 'Failed to join barn' },
      { status: 500 }
    );
  }
}
