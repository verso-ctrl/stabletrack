import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RecurringRule {
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  interval: number;
  daysOfWeek?: string[];
  dayOfMonth?: number;
  endType: 'NEVER' | 'ON_DATE' | 'AFTER_COUNT';
  endDate?: string;
  endCount?: number;
  occurrenceCount?: number; // Track how many times this has occurred
}

// Calculate the next due date based on the recurring rule
function calculateNextDueDate(currentDate: Date, rule: RecurringRule): Date | null {
  const nextDate = new Date(currentDate);

  // Check if we've exceeded the end condition
  if (rule.endType === 'ON_DATE' && rule.endDate) {
    const endDate = new Date(rule.endDate);
    if (currentDate >= endDate) {
      return null; // No more occurrences
    }
  }
  if (rule.endType === 'AFTER_COUNT' && rule.endCount && rule.occurrenceCount) {
    if (rule.occurrenceCount >= rule.endCount) {
      return null; // No more occurrences
    }
  }

  switch (rule.type) {
    case 'DAILY':
      nextDate.setDate(nextDate.getDate() + 1);
      break;

    case 'WEEKLY':
      if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        const dayMap: Record<string, number> = {
          SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
        };
        const currentDay = nextDate.getDay();
        const targetDays = rule.daysOfWeek.map((d) => dayMap[d]).sort((a, b) => a - b);

        // Find the next day in the current or next week
        let foundNext = false;
        for (const targetDay of targetDays) {
          if (targetDay > currentDay) {
            nextDate.setDate(nextDate.getDate() + (targetDay - currentDay));
            foundNext = true;
            break;
          }
        }
        if (!foundNext) {
          // Move to first day of next week
          const daysUntilNextWeek = 7 - currentDay + targetDays[0];
          nextDate.setDate(nextDate.getDate() + daysUntilNextWeek);
        }
      } else {
        nextDate.setDate(nextDate.getDate() + 7);
      }
      break;

    case 'MONTHLY':
      const targetDay = rule.dayOfMonth || nextDate.getDate();
      nextDate.setMonth(nextDate.getMonth() + 1);
      // Handle months with fewer days
      const daysInMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
      nextDate.setDate(Math.min(targetDay, daysInMonth));
      break;

    case 'CUSTOM':
      nextDate.setDate(nextDate.getDate() + (rule.interval || 1));
      break;

    default:
      return null;
  }

  // Final check against end date
  if (rule.endType === 'ON_DATE' && rule.endDate) {
    const endDate = new Date(rule.endDate);
    if (nextDate > endDate) {
      return null;
    }
  }

  return nextDate;
}

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

      // If this is a recurring task, create the next occurrence
      if (task.isRecurring && task.recurringRule) {
        try {
          const rule: RecurringRule = JSON.parse(task.recurringRule);
          const currentDueDate = task.dueDate || new Date();

          // Increment occurrence count
          rule.occurrenceCount = (rule.occurrenceCount || 0) + 1;

          const nextDueDate = calculateNextDueDate(currentDueDate, rule);

          if (nextDueDate) {
            // Create the next task occurrence
            await prisma.task.create({
              data: {
                barnId: barnId,
                title: task.title,
                description: task.description,
                dueDate: nextDueDate,
                dueTime: task.dueTime,
                priority: task.priority,
                status: 'PENDING',
                assigneeId: task.assigneeId,
                isRecurring: true,
                recurringRule: JSON.stringify(rule),
              },
            });
          }
        } catch (err) {
          console.error('Error creating next recurring task:', err);
          // Don't fail the request if recurring creation fails
        }
      }
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
