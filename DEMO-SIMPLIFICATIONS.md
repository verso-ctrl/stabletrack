# StableTrack Demo Simplifications

This document records what was simplified, hidden, or stubbed out in this demo version of StableTrack. Use this as a reference when building out the full production version.

---

## Subscription & Billing System

### Current Demo State
- **3 tiers only**: FREE, BASIC, ADVANCED
- **Only difference is horse count**: 3, 15, unlimited
- **Pricing**: $0, $19/mo, $39/mo
- **All features enabled on all tiers** (no feature gating)

### What Was Removed/Simplified

#### Original 4-Tier System
The original system had 4 tiers with different feature sets:
- `FREE` - Basic features, limited horses
- `PROFESSIONAL` - More horses, task management, feed calendar, basic reporting
- `FARM` - Training scheduling, lesson management, invoicing
- `ENTERPRISE` - Multi-location, advanced analytics, API access

#### Add-Ons System (Removed)
- `AddOnsList` component was removed from `PricingPlans.tsx`
- Add-ons were available: `EXTRA_STORAGE`, `ADDITIONAL_USERS`
- The `AddOnType` type and `SubscriptionAddOn` interface remain for backward compatibility but are not used

#### Feature Gating (Disabled)
All these features are now enabled for everyone (were previously tier-gated):
- `canUploadPhotos`
- `canUploadDocuments`
- `canBulkUpload`
- `canDownloadOriginals`
- `canShareDocuments`
- `taskManagement`
- `feedCalendar`
- `basicReporting`
- `trainingScheduling`
- `lessonManagement`
- `invoicing`
- `multiLocation`
- `advancedAnalytics`
- `apiAccess`
- `competitionTracking`
- `breedingManagement`
- `customBranding`
- `prioritySupport`

#### Limit Differences (Simplified)
Original limits varied by tier:
- `maxPhotosPerHorse`: Was 10/25/50/unlimited, now 50 for all
- `maxTeamMembers`: Was 1/3/10/unlimited, now 10 for all
- `maxStorageBytes`: Was 1GB/5GB/25GB/100GB, now 25GB for all
- `maxHorses`: **Only remaining difference** - 3/15/unlimited

### Files Modified for Tier Simplification
- `src/types/index.ts` - Changed `SubscriptionTier` type
- `src/lib/tiers.ts` - Rewrote tier configuration
- `src/components/billing/PricingPlans.tsx` - Simplified UI, removed AddOnsList
- `src/contexts/SubscriptionContext.tsx` - Changed default to BASIC
- `src/lib/tier-validation.ts` - Demo always returns BASIC
- `src/lib/auth.ts` - Default tier changed to BASIC
- `src/hooks/useTierPermissions.tsx` - Default tier changed to BASIC
- `src/components/subscription/FeatureGate.tsx` - Updated tier references
- `src/components/subscription/UpgradeModal.tsx` - Updated tier references
- `src/components/storage/UpgradePrompt.tsx` - Updated pricing display
- `src/components/storage/HorsePhotoGallery.tsx` - Hardcoded BASIC tier
- `src/components/storage/DocumentManager.tsx` - Updated tier references
- `src/app/api/storage/quota/route.ts` - Hardcoded BASIC tier
- `src/app/onboarding/create-barn/page.tsx` - Updated tier options
- `prisma/schema.prisma` - Updated default values and comments

---

## Stripe Integration

### Current Demo State
- All Stripe-related actions show toast: "Demo Mode - Billing is disabled"
- No actual Stripe API calls are made
- Checkout and billing portal are stubbed

### What Needs to Be Implemented for Production
1. **Environment Variables**:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_ID_BASIC_MONTHLY`
   - `STRIPE_PRICE_ID_BASIC_ANNUAL`
   - `STRIPE_PRICE_ID_ADVANCED_MONTHLY`
   - `STRIPE_PRICE_ID_ADVANCED_ANNUAL`

2. **Stripe Products to Create**:
   - Basic Plan ($19/mo or $190/year)
   - Advanced Plan ($39/mo or $390/year)

3. **Webhook Endpoints**:
   - `checkout.session.completed` - Activate subscription
   - `customer.subscription.updated` - Handle plan changes
   - `customer.subscription.deleted` - Handle cancellations
   - `invoice.payment_failed` - Handle failed payments

4. **Files to Update**:
   - `src/contexts/SubscriptionContext.tsx` - Replace demo toasts with real Stripe calls
   - `src/app/api/billing/create-checkout/route.ts` - Implement Stripe checkout
   - `src/app/api/stripe/webhook/route.ts` - Handle Stripe webhooks (may need to create)

---

## Authentication

### Current Demo State
- Clerk authentication is optional (checks `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
- When Clerk is not configured, demo mode creates a fake user
- Demo users get BASIC tier by default

### What's Hidden
- Full Clerk integration is present but bypassed in demo mode
- User management, password reset, etc. all work when Clerk is configured

---

## Database

### Current Demo State
- Uses local PostgreSQL with Prisma
- Seed data creates demo barn with sample horses

### Prisma Schema Notes
- `Subscription.tier` defaults to "BASIC"
- `Subscription.maxHorses` defaults to 15
- Comment in schema still references old tiers (documentation only)

---

## Navigation Simplifications (v1)

### Removed/Hidden Navigation Items
- Help link removed from sidebar
- Settings sub-items consolidated (was separate nav items)

### Current Navigation Structure
- Dashboard
- Horses
- Calendar
- Tasks
- Clients
- Settings (single item with sub-pages)

---

## Mobile UI

### Current State
- Basic responsive design exists
- Full mobile redesign plan exists in `/.claude/plans/` but not implemented

### Planned Mobile Features (Not Implemented)
- Bottom sheet modals
- Swipe gestures
- Pull to refresh
- Offline support
- Camera integration for photo uploads
- Haptic feedback

---

## Features Present But May Need Polish

### Fully Functional
- Horse management (CRUD)
- Photo uploads to local storage
- Health records
- Vaccination tracking
- Weight logging
- Feed program management
- Calendar/Events
- Tasks
- Team management
- Client management

### Functional But Basic
- Document management
- Training logs
- Lesson management
- Competition tracking
- Invoicing (basic)
- Daily health checks

### Stubbed/Incomplete
- Stripe billing integration
- Email notifications
- SMS notifications
- Calendar sync (Google/iCal)
- QuickBooks export
- Advanced analytics
- Multi-location support
- API access for third parties

---

## Environment Variables for Production

```env
# Required for production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL=postgresql://...

# Storage (if using cloud storage instead of local)
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
# AWS_S3_BUCKET=...
```

---

## Quick Reference: Tier Migration

If restoring the full 4-tier system:

| Old Tier | New Tier | Notes |
|----------|----------|-------|
| FREE | FREE | Keep as-is |
| PROFESSIONAL | BASIC | Merge features |
| FARM | BASIC | Was demo default |
| ENTERPRISE | ADVANCED | Top tier |

The `normalizeTier()` function in `src/lib/tiers.ts` handles legacy tier name mapping.

---

*Last updated: January 2026*
*Demo version for StableTrack launch*
