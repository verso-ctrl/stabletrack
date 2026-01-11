import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/barns/[barnId]/tasks - Get tasks for a barn
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
    
    const hasPermission = await checkBarnPermission(user.id, barnId, 'tasks:read');
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Parse query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assigneeId = searchParams.get('assigneeId');
    const dueDate = searchParams.get('dueDate');
    const priority = searchParams.get('priority');
    
    // Build where clause
    const where: any = { barnId: barnId };
    
    if (status) {
      where.status = status;
    }
    
    if (assigneeId) {
      where.assigneeId = assigneeId;
    }
    
    if (dueDate) {
      const date = new Date(dueDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      where.dueDate = {
        gte: date,
        lt: nextDay,
      };
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    
    return NextResponse.json({ data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/barns/[barnId]/tasks - Create a new task
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
    
    const hasPermission = await checkBarnPermission(user.id, barnId, 'tasks:write');
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    const {
      title,
      description,
      dueDate,
      dueTime,
      priority,
      assigneeId,
      isRecurring,
      recurringRule,
    } = body;
    
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    const task = await prisma.task.create({
      data: {
        barnId: barnId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        dueTime,
        priority: priority || 'MEDIUM',
        status: 'PENDING',
        assigneeId,
        isRecurring: isRecurring || false,
        recurringRule,
      },
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
    
    return NextResponse.json({ data: task });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
