/**
 * Cleanup script: Merge invited users with their Clerk accounts.
 *
 * When a user is directly invited by email, a DB user is created with a cuid.
 * When they sign in via Clerk, a second user may be created with the Clerk ID.
 * This script merges them so the Clerk user inherits the barn memberships.
 *
 * Usage: npx tsx scripts/cleanup-invited-users.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Emails to fix
const EMAILS_TO_FIX = [
  'sumbrerojustice@gmail.com',
  'zvega@umich.edu',
];

async function main() {
  for (const email of EMAILS_TO_FIX) {
    console.log(`\n--- Processing ${email} ---`);

    // Find the original invited user (non-Clerk ID)
    const invitedUser = await prisma.user.findUnique({
      where: { email },
      include: {
        subscription: true,
        barnMemberships: { include: { barn: { select: { name: true } } } },
      },
    });

    if (!invitedUser) {
      console.log(`  No user found with email ${email}`);

      // Check if there's a pending email user
      const pendingUsers = await prisma.user.findMany({
        where: { email: { contains: '@pending.barnkeep.com' } },
      });
      for (const pu of pendingUsers) {
        console.log(`  Found pending user: id=${pu.id}, email=${pu.email}`);
      }
      continue;
    }

    console.log(`  Invited user: id=${invitedUser.id}, memberships=${invitedUser.barnMemberships.length}`);
    for (const m of invitedUser.barnMemberships) {
      console.log(`    - Barn: ${m.barn.name}, Role: ${m.role}, Status: ${m.status}`);
    }

    // Check if this is already a Clerk user
    if (invitedUser.id.startsWith('user_')) {
      console.log(`  Already a Clerk user, skipping.`);
      continue;
    }

    // Find the duplicate Clerk user (with pending email or same email collision)
    const pendingEmail = `${email.replace('@', '_at_')}`;
    const allUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: '@pending.barnkeep.com' } },
          { email: { contains: '@migrating.barnkeep.com' } },
        ],
        id: { startsWith: 'user_' },
      },
      include: {
        subscription: true,
        barnMemberships: true,
      },
    });

    // Try to find the Clerk user that corresponds to this email
    // They would have signed in recently and gotten a pending email
    const clerkUser = allUsers.find(u => {
      // The pending email format is `{clerkId}@pending.barnkeep.com`
      return u.barnMemberships.length === 0; // Clerk users created from collision have no memberships
    });

    if (!clerkUser) {
      console.log(`  No duplicate Clerk user found. Available pending users:`);
      for (const u of allUsers) {
        console.log(`    id=${u.id}, email=${u.email}, memberships=${u.barnMemberships.length}`);
      }
      console.log(`  You may need to have the user sign in first, then re-run this script.`);
      console.log(`  Or manually specify the Clerk user ID.`);
      continue;
    }

    console.log(`  Found Clerk user: id=${clerkUser.id}, email=${clerkUser.email}`);
    console.log(`  Merging...`);

    await prisma.$transaction(async (tx) => {
      // Transfer barn memberships from invited user to Clerk user
      await tx.barnMember.updateMany({
        where: { userId: invitedUser.id },
        data: { userId: clerkUser.id },
      });

      // Transfer approvedBy references
      await tx.barnMember.updateMany({
        where: { approvedBy: invitedUser.id },
        data: { approvedBy: clerkUser.id },
      });

      // Transfer activity logs
      await tx.activityLog.updateMany({
        where: { userId: invitedUser.id },
        data: { userId: clerkUser.id },
      });

      // Update Clerk user's email to the real email
      await tx.user.update({
        where: { id: clerkUser.id },
        data: { email },
      });

      // Clear invited user's email to avoid unique constraint, then delete
      await tx.user.update({
        where: { id: invitedUser.id },
        data: { email: `${invitedUser.id}@deleted.barnkeep.com` },
      });

      await tx.user.delete({ where: { id: invitedUser.id } });
    });

    console.log(`  Merged! ${clerkUser.id} now has ${email} and all barn memberships.`);
  }

  // Summary: list all users
  console.log('\n--- Current users ---');
  const users = await prisma.user.findMany({
    include: {
      barnMemberships: { select: { role: true, status: true, barn: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'asc' },
  });

  for (const u of users) {
    console.log(`  ${u.id} | ${u.email} | ${u.firstName} ${u.lastName} | memberships: ${u.barnMemberships.length}`);
    for (const m of u.barnMemberships) {
      console.log(`    - ${m.barn.name} (${m.role}, ${m.status})`);
    }
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
