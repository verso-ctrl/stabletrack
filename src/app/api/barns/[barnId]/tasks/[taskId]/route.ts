import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/barns/[barnId]/tasks/[taskId] - Get task details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string; taskId: string }> }
) {
  try {
    const { barnId, taskId } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const hasPermission = await checkBarnPermission(user.id, barnId, 'tasks:read');
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
        barnId: barnId,
      },
      include: {
        assignee: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
            email: true,
          },
        },
      },
    });
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    return NextResponse.json({ data: task });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

// PATCH /api/barns/[barnId]/tasks/[taskId] - Update task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string; taskId: string }> }
) {
  try {
    const { barnId, taskId } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const hasPermission = await checkBarnPermission(user.id, barnId, 'tasks:write');
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    const { id, barnId: _, creatorId, createdAt, ...updateData } = body;
    
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }
    
    if (updateData.status === 'COMPLETED') {
      updateData.completedAt = new Date();
      updateData.completedBy = user.id;
    }
    
    const task = await prisma.task.update({
      where: {
        id: taskId,
        barnId: barnId,
      },
      data: updateData,
      include: {
        assignee: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
    
    if (updateData.status === 'COMPLETED') {
      await prisma.activityLog.create({
        data: {
          type: 'TASK_COMPLETED',
          description: `Completed task: "${task.title}"`,
          userId: user.id,
          barnId: barnId,
          metadata: JSON.stringify({ taskId: task.id }),
        },
      });
    }
    
    return NextResponse.json({ data: task });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE /api/barns/[barnId]/tasks/[taskId] - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string; taskId: string }> }
) {
  try {
    const { barnId, taskId } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const hasPermission = await checkBarnPermission(user.id, barnId, 'tasks:write');
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    await prisma.task.delete({
      where: {
        id: taskId,
        barnId: barnId,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
