import { prisma } from './prisma';
import type { BarnRole } from '@/types';

// Check if Clerk is configured (use secret key for server-side)
const isClerkConfigured = 
  process.env.CLERK_SECRET_KEY &&
  !process.env.CLERK_SECRET_KEY.includes('your_key') &&
  !process.env.CLERK_SECRET_KEY.includes('_here');

// Demo user ID for when Clerk is not configured
const DEMO_USER_ID = 'demo-user-001';

/**
 * Get the current authenticated user
 * Uses Clerk when configured, otherwise returns demo user
 */
export async function getCurrentUser() {
  let userId: string | null = null;
  let clerkUser: any = null;

  if (isClerkConfigured) {
    // Dynamic import to avoid errors when Clerk is not configured
    const { auth, currentUser } = await import('@clerk/nextjs/server');
    const authResult = await auth();
    userId = authResult.userId;
    
    if (!userId) {
      return null;
    }
    
    clerkUser = await currentUser();
  } else {
    // Demo mode
    userId = DEMO_USER_ID;
  }
  
  // Get or create user in our database
  let user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
    },
  });
  
  if (!user) {
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress || 'demo@stabletrack.com';
    
    // Check if a user with this email already exists (from previous sign-up with different ID)
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
      include: { 
        subscription: true,
        barnMemberships: true,
      },
    });
    
    if (existingUserByEmail) {
      // User exists with different ID - need to migrate their data to new Clerk ID
      // Use a transaction to safely migrate the user
      user = await prisma.$transaction(async (tx) => {
        // Update all barn memberships to the new user ID
        await tx.barnMember.updateMany({
          where: { userId: existingUserByEmail.id },
          data: { userId: userId },
        });
        
        // Delete old subscription if exists
        if (existingUserByEmail.subscription) {
          await tx.subscription.delete({
            where: { userId: existingUserByEmail.id },
          });
        }
        
        // Delete the old user record
        await tx.user.delete({
          where: { id: existingUserByEmail.id },
        });
        
        // Create new user with the correct Clerk ID
        return await tx.user.create({
          data: {
            id: userId,
            email,
            firstName: clerkUser?.firstName || existingUserByEmail.firstName || 'User',
            lastName: clerkUser?.lastName || existingUserByEmail.lastName || '',
            avatarUrl: clerkUser?.imageUrl || existingUserByEmail.avatarUrl || null,
            subscription: {
              create: {
                tier: existingUserByEmail.subscription?.tier || (isClerkConfigured ? 'FREE' : 'FARM'),
                status: existingUserByEmail.subscription?.status || 'ACTIVE',
                maxHorses: existingUserByEmail.subscription?.maxHorses || (isClerkConfigured ? 5 : 999),
                maxBarns: existingUserByEmail.subscription?.maxBarns || (isClerkConfigured ? 1 : 10),
                storageGb: existingUserByEmail.subscription?.storageGb || (isClerkConfigured ? 1 : 50),
              },
            },
          },
          include: {
            subscription: true,
          },
        });
      });
    } else {
      // Create new user in our database
      user = await prisma.user.create({
        data: {
          id: userId,
          email,
          firstName: clerkUser?.firstName || 'Demo',
          lastName: clerkUser?.lastName || 'User',
          avatarUrl: clerkUser?.imageUrl || null,
          subscription: {
            create: {
              tier: isClerkConfigured ? 'FREE' : 'FARM',
              status: 'ACTIVE',
              maxHorses: isClerkConfigured ? 5 : 999,
              maxBarns: isClerkConfigured ? 1 : 10,
              storageGb: isClerkConfigured ? 1 : 50,
            },
          },
        },
        include: {
          subscription: true,
        },
      });
    }
  }
  
  return user;
}

/**
 * Get user's barn membership and role
 */
export async function getUserBarnMembership(userId: string, barnId: string) {
  const membership = await prisma.barnMember.findUnique({
    where: {
      userId_barnId: {
        userId,
        barnId,
      },
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });
  
  return membership;
}

/**
 * Check if user has permission for an action in a barn
 */
export async function checkBarnPermission(
  userId: string,
  barnId: string,
  permission: string
): Promise<boolean> {
  // First check if user is a barn member
  const membership = await getUserBarnMembership(userId, barnId);
  
  if (membership) {
    // Must be an ACTIVE member to have any permissions
    if ((membership as any).status !== 'ACTIVE') {
      return false;
    }
    
    const rolePermissions = getRolePermissions(membership.role as BarnRole);
    
    // Check for wildcard (owner has all permissions)
    if (rolePermissions.includes('*')) {
      return true;
    }
    
    return rolePermissions.includes(permission);
  }
  
  // Check if user is a client with access to this barn
  const clientAccess = await getClientAccess(userId, barnId);
  if (clientAccess) {
    const clientPermissions = getRolePermissions('CLIENT');
    // Check if permission matches client permissions (with :own suffix)
    const basePermission = permission.split(':').slice(0, 2).join(':');
    return clientPermissions.some(p => p.startsWith(basePermission));
  }
  
  return false;
}

/**
 * Get client access for a user in a barn
 */
export async function getClientAccess(userId: string, barnId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  
  if (!user) return null;
  
  const client = await prisma.client.findFirst({
    where: {
      barnId,
      OR: [
        { userId },
        { email: user.email },
      ],
    },
    include: {
      horses: {
        select: {
          horseId: true,
        },
      },
    },
  });
  
  return client;
}

/**
 * Get permissions for a role
 */
export function getRolePermissions(role: BarnRole): string[] {
  const permissions: Record<BarnRole, string[]> = {
    OWNER: ['*'],
    MANAGER: [
      'horses:read', 'horses:write', 'horses:delete',
      'health:read', 'health:write',
      'events:read', 'events:write', 'events:delete',
      'tasks:read', 'tasks:write', 'tasks:assign',
      'team:read', 'team:write', 'team:invite',
      'clients:read', 'clients:write',
      'billing:read', 'billing:write',
      'reports:read',
      'settings:read',
      'documents:read', 'documents:write',
      'feed:read', 'feed:write',
      'training:read', 'training:write',
      'lessons:read', 'lessons:write',
      'competitions:read', 'competitions:write',
    ],
    TRAINER: [
      'horses:read',
      'health:read',
      'events:read', 'events:write',
      'tasks:read', 'tasks:write',
      'clients:read',
      'documents:read',
      'training:read', 'training:write',
      'lessons:read', 'lessons:write',
      'competitions:read', 'competitions:write',
    ],
    CARETAKER: [
      'horses:read', 'horses:write',
      'health:read', 'health:write',
      'events:read', 'events:write',
      'tasks:read', 'tasks:write',
      'feed:read', 'feed:write',
      'training:read', 'training:write',
      'lessons:read',
      'competitions:read',
      'documents:read',
    ],
    CLIENT: [
      'horses:read:own',
      'health:read:own',
      'events:read:own',
      'billing:read:own',
      'documents:read:own',
      'lessons:read:own',
      'competitions:read:own',
    ],
  };
  
  return permissions[role] || [];
}

/**
 * Get all barns the user is a member of
 */
export async function getUserBarns(userId: string) {
  const memberships = await prisma.barnMember.findMany({
    where: { 
      userId,
      status: 'ACTIVE',
    },
    include: {
      barn: {
        include: {
          _count: {
            select: {
              horses: true,
              members: true,
            },
          },
        },
      },
    },
  });
  
  return memberships.map((m) => ({
    ...m.barn,
    role: m.role,
    accessType: 'member' as const,
    memberCount: m.barn._count.members,
    horseCount: m.barn._count.horses,
  }));
}

/**
 * Get all barns where user is a client
 */
export async function getUserClientBarns(userId: string) {
  // First get user's email
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  
  if (!user) return [];
  
  // Find client profiles linked by userId OR email
  const clientProfiles = await prisma.client.findMany({
    where: {
      OR: [
        { userId },
        { email: user.email },
      ],
      portalEnabled: true,
    },
    include: {
      barn: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          address: true,
          city: true,
          state: true,
        },
      },
      horses: {
        include: {
          horse: {
            select: {
              id: true,
              barnName: true,
              profilePhotoUrl: true,
            },
          },
        },
      },
    },
  });
  
  // If any client profile matched by email but not linked, link them now
  for (const profile of clientProfiles) {
    if (!profile.userId) {
      await prisma.client.update({
        where: { id: profile.id },
        data: { userId },
      });
    }
  }
  
  return clientProfiles.map((cp) => ({
    ...cp.barn,
    clientId: cp.id,
    accessType: 'client' as const,
    role: 'CLIENT',
    horseCount: cp.horses.length,
    horses: cp.horses.map(h => h.horse),
  }));
}

/**
 * Get all barns user has access to (as member OR client)
 */
export async function getAllUserBarns(userId: string) {
  const [memberBarns, clientBarns] = await Promise.all([
    getUserBarns(userId),
    getUserClientBarns(userId),
  ]);
  
  // Deduplicate in case user is both member and client of same barn
  const barnIds = new Set<string>();
  const allBarns: Array<typeof memberBarns[0] | typeof clientBarns[0]> = [];
  
  // Member barns take priority
  for (const barn of memberBarns) {
    barnIds.add(barn.id);
    allBarns.push(barn);
  }
  
  // Add client barns that aren't already included
  for (const barn of clientBarns) {
    if (!barnIds.has(barn.id)) {
      allBarns.push(barn);
    }
  }
  
  return allBarns;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

/**
 * Verify user has access to a barn (any role including client)
 */
export async function verifyBarnAccess(userId: string, barnId: string): Promise<boolean> {
  const membership = await getUserBarnMembership(userId, barnId);
  if (membership) return true;
  
  // Also check for client access
  const clientAccess = await getClientAccess(userId, barnId);
  return !!clientAccess;
}

/**
 * Require barn membership with specific permission
 */
export async function requireBarnPermission(barnId: string, permission: string) {
  const user = await requireAuth();
  
  const hasPermission = await checkBarnPermission(user.id, barnId, permission);
  
  if (!hasPermission) {
    throw new Error('Forbidden');
  }
  
  return user;
}

/**
 * Get the current user ID (for server components)
 */
export async function getAuthUserId(): Promise<string | null> {
  if (isClerkConfigured) {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    return userId;
  }
  return DEMO_USER_ID;
}
