import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { enforceActiveSubscription, enforceTeamMemberLimit } from '@/lib/tier-validation';
import { notifyDirectInvite, notifyJoinApproved } from '@/lib/email';

// GET /api/barns/[barnId]/members - Get all barn members
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

    // Check if user is an ACTIVE member (owners/managers need to see pending too)
    const userMembership = await prisma.barnMember.findUnique({
      where: {
        userId_barnId: {
          userId: user.id,
          barnId: barnId,
        },
      },
    });

    if (!userMembership || !userMembership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const hasPermission = await checkBarnPermission(user.id, barnId, 'team:read');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all members including pending ones (for owners to approve)
    const members = await prisma.barnMember.findMany({
      where: { barnId: barnId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            phone: true,
          },
        },
      },
      orderBy: [
         // ACTIVE first, then PENDING
        { joinedAt: 'asc' },
      ],
    });

    return NextResponse.json({ data: members });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

// POST /api/barns/[barnId]/members - Invite a new member (create user if needed)
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

    const hasPermission = await checkBarnPermission(user.id, barnId, 'team:invite');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Enforce subscription status and team member limit
    try {
      await enforceActiveSubscription(barnId);
      await enforceTeamMemberLimit(barnId);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Plan limit reached' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, role, firstName, lastName } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let invitedUser = await prisma.user.findUnique({
      where: { email },
    });

    // Create user if doesn't exist
    if (!invitedUser) {
      invitedUser = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
        },
      });
    }

    // Check if already a member
    const existingMember = await prisma.barnMember.findUnique({
      where: {
        userId_barnId: {
          userId: invitedUser.id,
          barnId: barnId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this barn' },
        { status: 400 }
      );
    }

    // Add as barn member (direct invite = immediately ACTIVE)
    const member = await prisma.barnMember.create({
      data: {
        userId: invitedUser.id,
        barnId: barnId,
        role,
        status: 'ACTIVE',
        approvedAt: new Date(),
        approvedBy: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        barnId: barnId,
        userId: user.id,
        type: 'MEMBER_INVITED',
        description: `Invited ${email} as ${role}`,
        metadata: JSON.stringify({ memberId: member.id, invitedUserId: invitedUser.id }),
      },
    });

    // Fire-and-forget email notification
    const barn = await prisma.barn.findUnique({ where: { id: barnId }, select: { name: true } });
    notifyDirectInvite(email, barn?.name || 'your barn', role);

    return NextResponse.json({ data: member }, { status: 201 });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}

// PATCH /api/barns/[barnId]/members - Update a member's role or status (approve/reject)
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

    // Only owners can change roles or approve members
    const membership = await prisma.barnMember.findUnique({
      where: {
        userId_barnId: {
          userId: user.id,
          barnId: barnId,
        },
      },
    });

    if (!membership || membership.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only owners can manage members' }, { status: 403 });
    }

    const body = await request.json();
    const { memberId, role, action } = body;

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const targetMember = await prisma.barnMember.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!targetMember || targetMember.barnId !== barnId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Handle approval/rejection
    if (action === 'approve') {
      if (targetMember.status !== 'PENDING') {
        return NextResponse.json({ error: 'Member is not pending approval' }, { status: 400 });
      }

      // Enforce team member limit before approving
      try {
        await enforceTeamMemberLimit(barnId);
      } catch {
        return NextResponse.json(
          { error: 'Team member limit reached for your plan. Upgrade to add more members.' },
          { status: 403 }
        );
      }

      const updatedMember = await prisma.barnMember.update({
        where: { id: memberId },
        data: {
          status: 'ACTIVE',
          role: role || targetMember.role,
          approvedAt: new Date(),
          approvedBy: user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              phone: true,
            },
          },
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          barnId: barnId,
          userId: user.id,
          type: 'MEMBER_APPROVED',
          description: `Approved ${targetMember.user.email} as ${role || targetMember.role}`,
          metadata: JSON.stringify({ memberId, approvedUserId: targetMember.userId }),
        },
      });

      // Fire-and-forget email notification
      const barn = await prisma.barn.findUnique({ where: { id: barnId }, select: { name: true } });
      notifyJoinApproved(targetMember.user.email, barn?.name || 'your barn', role || targetMember.role);

      return NextResponse.json({ data: updatedMember });
    }

    if (action === 'reject') {
      if (targetMember.status !== 'PENDING') {
        return NextResponse.json({ error: 'Member is not pending approval' }, { status: 400 });
      }

      // Delete the pending membership
      await prisma.barnMember.delete({
        where: { id: memberId },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          barnId: barnId,
          userId: user.id,
          type: 'MEMBER_REJECTED',
          description: `Rejected join request from ${targetMember.user.email}`,
          metadata: JSON.stringify({ rejectedUserId: targetMember.userId }),
        },
      });

      return NextResponse.json({ success: true });
    }

    // Handle role change (existing functionality)
    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }

    if (targetMember.userId === user.id) {
      return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
    }

    if (targetMember.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Can only change role of active members' }, { status: 400 });
    }

    // Update the role
    const updatedMember = await prisma.barnMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            phone: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        barnId: barnId,
        userId: user.id,
        type: 'MEMBER_ROLE_CHANGED',
        description: `Changed ${targetMember.user.email} role to ${role}`,
        metadata: JSON.stringify({ memberId, oldRole: targetMember.role, newRole: role }),
      },
    });

    return NextResponse.json({ data: updatedMember });
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}

// DELETE /api/barns/[barnId]/members - Remove a member
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

    // Only owners can remove members
    const membership = await prisma.barnMember.findUnique({
      where: {
        userId_barnId: {
          userId: user.id,
          barnId: barnId,
        },
      },
    });

    if (!membership || membership.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only owners can remove members' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const targetMember = await prisma.barnMember.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!targetMember || targetMember.barnId !== barnId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Prevent removing yourself
    if (targetMember.userId === user.id) {
      return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 });
    }

    // Prevent removing another owner (there should always be at least one)
    if (targetMember.role === 'OWNER') {
      const ownerCount = await prisma.barnMember.count({
        where: { barnId: barnId, role: 'OWNER' },
      });
      if (ownerCount <= 1) {
        return NextResponse.json({ error: 'Cannot remove the last owner' }, { status: 400 });
      }
    }

    // Remove the member
    await prisma.barnMember.delete({
      where: { id: memberId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        barnId: barnId,
        userId: user.id,
        type: 'MEMBER_REMOVED',
        description: `Removed ${targetMember.user.email} from barn`,
        metadata: JSON.stringify({ memberId, removedUserId: targetMember.userId }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}
