# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StableTrack is a simple, affordable barn management app built for small horse farms. The target audience is small farm owners who can't justify the cost of enterprise barn management software designed for large operations. The tone and UX should be friendly, approachable, and straightforward — not corporate or overwhelming.

**Product & Pricing:**
- **Core Plan — $25/month:** Includes everything a small farm needs day-to-day:
  - Horse profiles & management
  - Feed tracking & feed charts
  - Stall assignments
  - Pasture/paddock assignments
  - Medication & health records (vaccinations, vet visits, daily health checks)
  - Daily care logs
  - Calendar & scheduling
  - Task management
  - Document storage
  - Activity log
- **Purchaseable Add-Ons** (each sold separately on top of the core plan):
  - Breeding Tracker — heat cycles, breeding records, foaling management
  - Training & Lessons — training logs, lesson scheduling, competition tracking
  - Client & Billing — client management, invoicing, payments, recurring billing
  - Team Management — multi-user access, role-based permissions, team coordination

When building features, keep the small-farm user in mind: prioritize clarity and simplicity over power-user complexity. Features should feel helpful, not enterprise-y.

**Tech Stack:**
- Frontend: Next.js 16.1.1, React 19, TypeScript 5.6.3, Tailwind CSS 3.4.15, Radix UI
- Backend: Next.js API routes, Prisma 5.22.0, PostgreSQL (Supabase)
- Auth: Clerk 6.36.5 (with demo mode fallback when unconfigured)
- State: React Query 5.60 (server state) + Zustand 5.0.1 (client state)
- Forms: React Hook Form 7.53.2 + Zod 3.25.76
- Payments: Stripe 20.1.0
- Charts: Recharts 2.13.3
- PDF: pdf-lib 1.17.1, pdfkit 0.17.2
- Mobile: Capacitor 8.0 for iOS/Android hybrid apps
- Testing: Jest 30.2.0, React Testing Library 16.3.1

## Common Commands

```bash
# Development
npm run dev                    # Start Next.js dev server

# Testing
npm run test                   # Run Jest tests
npm run test:watch             # Run tests in watch mode
npm run test:coverage          # Generate coverage report
npm run test:ci                # CI mode with coverage (2 workers)

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

# Build & Deploy
npm run build                  # Build for production
npm run start                  # Start production server

# Mobile (Capacitor)
npm run mobile:build           # Build + sync for mobile
npm run mobile:sync            # Sync web assets to native
npm run mobile:open:ios        # Open Xcode
npm run mobile:open:android    # Open Android Studio
npm run mobile:run:ios         # Run on iOS device/simulator
npm run mobile:run:android     # Run on Android device/emulator
```

## Architecture

### Directory Structure

```
stabletrack/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (dashboard)/       # Protected dashboard routes (19 sections)
│   │   │   ├── alerts/        # System alerts
│   │   │   ├── barns/         # Barn management
│   │   │   ├── billing/       # Billing management
│   │   │   ├── calendar/      # Calendar view
│   │   │   ├── clients/       # Client management
│   │   │   ├── daily-care/    # Daily care logs
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── documents/     # Document management
│   │   │   ├── feed-chart/    # Feed chart view
│   │   │   ├── help/          # Help page
│   │   │   ├── horses/        # Horse management
│   │   │   ├── lessons/       # Lesson scheduling
│   │   │   ├── log/           # Activity log
│   │   │   ├── pastures/      # Pasture management
│   │   │   ├── schedule/      # Schedule view
│   │   │   ├── settings/      # Barn settings
│   │   │   ├── tasks/         # Task management
│   │   │   ├── team/          # Team management
│   │   │   └── training/      # Training logs
│   │   ├── (marketing)/       # Public pages (pricing, privacy, terms)
│   │   ├── api/               # REST API endpoints (57+ routes)
│   │   ├── onboarding/        # User onboarding (create-barn, join-barn)
│   │   ├── portal/            # Client portal
│   │   └── sign-in/sign-up/   # Auth pages (Clerk)
│   ├── components/            # React components
│   │   ├── ui/                # Design system (Button, Dialog, Input, Select, Toast, etc.)
│   │   ├── dashboard/         # Dashboard layout (DashboardContent, Shell, Sidebar)
│   │   ├── horses/            # Horse management (AddHorseForm, HorseCard, HorseList, etc.)
│   │   ├── events/            # Event management
│   │   ├── billing/           # Billing/subscription components
│   │   ├── storage/           # File upload components
│   │   ├── subscription/      # Plan & add-on display components
│   │   └── auth/              # Auth components
│   ├── lib/                   # Core utilities (20 files)
│   │   ├── auth.ts            # Authentication layer (Clerk + demo mode)
│   │   ├── prisma.ts          # Database client singleton
│   │   ├── tiers.ts           # Core plan + add-on configuration
│   │   ├── tier-validation.ts # Plan & add-on enforcement logic
│   │   ├── validations.ts     # Zod schemas
│   │   ├── api-helpers.ts     # API request/response utilities
│   │   ├── queryKeys.ts       # React Query cache keys and stale times
│   │   ├── rate-limit.ts      # Rate limiting (30 writes/min, 10 uploads/min)
│   │   ├── security.ts        # CSRF protection, sanitization
│   │   ├── csrf.ts            # CSRF token generation/validation
│   │   ├── sanitize.ts        # Input sanitization
│   │   ├── storage.ts         # Client-side file storage
│   │   ├── storage-server.ts  # Server-side file storage
│   │   ├── supabase.ts        # Supabase client for storage
│   │   ├── mobile.ts          # Capacitor integration utilities
│   │   ├── toast.ts           # Toast notification utilities
│   │   ├── sentry.ts          # Error tracking setup
│   │   ├── server-cache.ts    # Server-side permission caching
│   │   ├── utils.ts           # General utilities
│   │   └── middleware/        # Rate limit middleware
│   ├── hooks/                 # React hooks
│   │   ├── useData.ts         # React Query data fetching hooks
│   │   ├── useMutations.ts    # React Query mutation hooks
│   │   ├── useFacilities.ts   # Barn facilities hooks (stalls, paddocks)
│   │   ├── useStorage.ts      # File upload hooks
│   │   └── useTierPermissions.tsx  # Plan & add-on permission checks
│   ├── contexts/              # React contexts
│   │   ├── BarnContext.tsx     # Current barn selection, barn list, roles
│   │   └── SubscriptionContext.tsx  # Plan status, active add-ons, feature gating
│   ├── types/                 # TypeScript type definitions (index.ts, 613 lines)
│   ├── middleware.ts          # Next.js middleware for auth and routing
│   └── styles/                # Global styles
├── prisma/
│   ├── schema.prisma          # Database schema (42 models)
│   ├── schema.postgres.prisma # PostgreSQL variant
│   ├── schema.sqlite.prisma   # SQLite variant for local dev
│   └── seed.ts                # Seed script
├── scripts/                   # Setup scripts (setup-db.ts, setup.ts)
├── capacitor.config.ts        # Capacitor mobile config
├── railway.json               # Railway deployment config
└── nixpacks.toml              # Nix build config
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

**Pricing Model (src/lib/tiers.ts):**
- Single core plan at $25/month — includes horse management, feed, stalls, pastures, medicine, calendar, tasks, documents
- Purchaseable add-ons: Breeding Tracker, Training & Lessons, Client & Billing, Team Management
- Add-on access is gated per-barn; features hidden in UI when add-on is not purchased
- NOTE: The codebase currently has a legacy FREE/BASIC/ADVANCED tier system that needs to be migrated to the new single-plan + add-ons model

**Multi-tenant Isolation:** All database queries scoped to `barnId`. Client access controlled via `ClientHorse` table. Team access via `BarnMember` with roles.

### Database

PostgreSQL via Supabase (SQLite available for local dev). 42 models organized as:

- **Users & Auth:** User, Subscription, BarnMember, HorseAccess
- **Core Entities:** Barn, Horse, Stall, Paddock, HorsePhoto, HorseTurnout
- **Health:** WeightRecord, Vaccination, Medication, MedicationLog, HealthRecord, HealthAttachment, DailyHealthCheck
- **Feed & Nutrition:** FeedType, Supplement, FeedProgram, FeedProgramItem, FeedLog, WaterLog
- **Events & Tasks:** Event, EventHorse, EventReminder, Task
- **Documents:** Document, Note, InventoryItem, ActivityLog
- **Billing:** Client, ClientHorse, Service, Invoice, InvoiceItem, Payment, RecurringInvoice, RecurringInvoiceItem
- **Training:** Lesson, TrainingLog, Competition

### TypeScript Paths

```typescript
import { Something } from '@/lib/something';     // ./src/lib/*
import { Component } from '@/components/...';    // ./src/components/*
import { useHook } from '@/hooks/...';          // ./src/hooks/*
import { Type } from '@/types/...';             // ./src/types/*
import { Context } from '@/contexts/...';       // ./src/contexts/*
```

## Environment Variables

Required variables (see `.env.example`):
- `DATABASE_URL` / `DIRECT_URL` - PostgreSQL connection strings
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` - Optional, enables Clerk auth
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - Clerk route config
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` - Optional, enables payments
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` - Optional, enables cloud storage
- `NEXT_PUBLIC_APP_URL` - App URL (default: http://localhost:3000)
- `DISABLE_DEMO_MODE` - Set to true to require Clerk auth

App runs in demo mode if Clerk keys are missing (unless `DISABLE_DEMO_MODE=true`).

## Testing

Tests use Jest 30.2.0 with React Testing Library. Test files are in `__tests__` directories:
- `src/lib/__tests__/` - API helpers and validation tests
- `src/components/__tests__/` - Component tests (ErrorBoundary)

```bash
npm run test                   # Run all tests
npm run test -- path/to/test   # Run specific test file
npm run test:ci                # CI mode with coverage
```

## Design Principles

- **Simple over powerful.** Small farm owners don't want dashboards with 50 metrics. Keep interfaces clean with only what matters.
- **Friendly tone.** Copy should be warm and conversational, not corporate. Think "helpful neighbor" not "enterprise vendor."
- **Affordable by design.** Every feature decision should consider: does a 5-horse hobby farm need this? If not, it's an add-on, not core.
- **Progressive disclosure.** Show the basics upfront. Advanced options (filters, bulk actions, exports) can be tucked behind menus or expandable sections.
- **Add-ons stay hidden until purchased.** Don't tease unpurchased features in the UI — keep the experience clean. Show add-on upsells only in the billing/settings area.

## Security

- CSRF protection via token generation/validation
- Input sanitization on all user inputs
- Rate limiting: 30 writes/min, 10 uploads/min
- Security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Zod validation on all API inputs
- Role-based permission checks on all routes
- Multi-tenant data isolation by barnId
