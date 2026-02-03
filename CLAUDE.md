# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StableTrack is a full-stack SaaS horse farm management application.

**Tech Stack:**
- Frontend: Next.js 16.1.1, React 19, TypeScript, Tailwind CSS, Radix UI
- Backend: Next.js API routes, Prisma ORM, PostgreSQL (Supabase)
- Auth: Clerk (with demo mode fallback when unconfigured)
- State: React Query (server state) + Zustand (client state)
- Mobile: Capacitor for iOS/Android hybrid apps

## Common Commands

```bash
# Development
npm run dev                    # Start Next.js dev server

# Testing
npm run test                   # Run Jest tests
npm run test:watch             # Run tests in watch mode
npm run test:coverage          # Generate coverage report

# Code Quality
npm run lint                   # ESLint check
npm run type-check             # TypeScript type checking

# Database
npm run db:generate            # Generate Prisma client
npm run db:push                # Push schema to database
npm run db:seed                # Seed database with test data
npm run db:studio              # Open Prisma Studio

# Setup (choose one)
npm run setup:sqlite           # Setup SQLite for local dev
npm run setup:supabase         # Setup Supabase (postgres)

# Build
npm run build                  # Build for production
npm run start                  # Start production server
```

## Architecture

### Directory Structure

```
stabletrack/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (dashboard)/       # Protected dashboard routes (horses, clients, calendar, etc.)
│   │   ├── (marketing)/       # Public pages (pricing, privacy, terms)
│   │   ├── api/               # REST API endpoints (62+ routes)
│   │   ├── onboarding/        # User onboarding flow
│   │   └── sign-in/sign-up/   # Auth pages (Clerk)
│   ├── components/            # React components (ui/, dashboard/, horses/, etc.)
│   ├── lib/                   # Core utilities
│   │   ├── auth.ts            # Authentication layer (Clerk + demo mode)
│   │   ├── prisma.ts          # Database client
│   │   ├── tiers.ts           # Subscription tier configuration
│   │   ├── validations.ts     # Zod schemas
│   │   ├── rate-limit.ts      # Rate limiting (30 writes/min, 10 uploads/min)
│   │   └── sanitize.ts        # Input sanitization
│   ├── hooks/                 # React hooks (useData.ts for React Query)
│   ├── contexts/              # React contexts (BarnContext, SubscriptionContext)
│   └── types/                 # TypeScript type definitions
├── prisma/
│   ├── schema.prisma          # Database schema (40+ models)
│   └── seed.ts                # Seed script
└── scripts/                   # Setup scripts
```

### Key Patterns

**Authentication (src/lib/auth.ts):**
- When Clerk is configured: uses Clerk for auth
- When Clerk is unconfigured: falls back to demo mode with hardcoded `demo-user-001`
- `getCurrentUser()` - Get authenticated user, auto-creates in Prisma on first login
- `checkBarnPermission(userId, barnId, permission)` - Role-based access control

**Roles:** OWNER (all permissions), MANAGER, TRAINER, CARETAKER, CLIENT (restricted to own horses)

**API Route Pattern:**
```typescript
export async function GET(req: Request, { params }: { params: { barnId: string } }) {
  const user = await getCurrentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const hasPermission = await checkBarnPermission(user.id, params.barnId, 'horses:read');
  if (!hasPermission) return new Response('Forbidden', { status: 403 });

  // ... handle request
}
```

**Subscription Tiers (src/lib/tiers.ts):**
- FREE: 3 horses, 2 team members, 5GB storage
- BASIC: 15 horses, 5 team members, 25GB storage
- ADVANCED: Unlimited horses/team, 100GB storage

### Database

PostgreSQL via Supabase. Key models:
- `User`, `Subscription`, `BarnMember` - Users and auth
- `Barn`, `Horse`, `Stall`, `Paddock` - Core entities
- `HealthRecord`, `Vaccination`, `Medication`, `DailyHealthCheck` - Health tracking
- `Event`, `Task`, `ActivityLog` - Operations
- `Client`, `Invoice`, `Service`, `Payment` - Billing
- `Lesson`, `TrainingLog`, `Competition` - Training

All queries scope to `barnId` for multi-tenant isolation.

### TypeScript Paths

```typescript
import { Something } from '@/lib/something';     // ./src/lib/*
import { Component } from '@/components/...';    // ./src/components/*
import { useHook } from '@/hooks/...';          // ./src/hooks/*
```

## Environment Variables

Required variables (see `.env.example`):
- `DATABASE_URL` / `DIRECT_URL` - PostgreSQL connection strings
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` - Optional, enables Clerk auth
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` - Optional, enables payments
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Optional, enables cloud storage

App runs in demo mode if Clerk keys are missing.

## Testing

Tests use Jest with React Testing Library. Test files are in `__tests__` directories.

```bash
npm run test                   # Run all tests
npm run test -- path/to/test   # Run specific test file
```
