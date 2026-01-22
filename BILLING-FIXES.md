# Billing & Subscription Flow Fixes

## Issues Fixed

### 1. Default Plan Selection Without Payment
**Problem:** New accounts automatically started with BASIC plan without requiring payment.

**Root Cause:** `SubscriptionContext.tsx` line 99 had `defaultTier = 'BASIC'`

**Fix:** Changed default tier to `'FREE'` so all new users start on the free plan.

**File Changed:** `/src/contexts/SubscriptionContext.tsx`
```typescript
// Before:
defaultTier = 'BASIC'  // Demo mode defaults to BASIC (15 horses)

// After:
defaultTier = 'FREE'  // Start with FREE tier until payment is made
```

---

### 2. Stripe Checkout API 500 Error
**Problem:** Barn creation failed with 500 error: "Failed to create checkout session"

**Root Cause:** The Stripe API initialization used non-null assertion (`!`) on `process.env.STRIPE_SECRET_KEY`, causing a crash when the environment variable wasn't set.

**Fix:** Added conditional Stripe initialization and proper error handling for when Stripe is not configured.

**File Changed:** `/src/app/api/stripe/create-checkout/route.ts`

```typescript
// Before:
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

// After:
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    })
  : null
```

Added check before creating checkout session:
```typescript
// If Stripe is not configured, return error with helpful message
if (!stripe) {
  return NextResponse.json(
    {
      error: 'Stripe is not configured',
      message: 'Please configure STRIPE_SECRET_KEY environment variable to enable payments. For development, you can create a barn with the FREE tier.',
      demoMode: true,
    },
    { status: 503 }
  )
}
```

---

### 3. Billing Upgrade Bypassing Stripe
**Problem:** Clicking "Upgrade" on the billing page changed the plan immediately without going through Stripe checkout.

**Root Cause:** The `PricingPlans` component was calling `changeTier()` directly for upgrades, which just updated localStorage without processing payment.

**Fix:**
1. Added upgrade confirmation modal with "Continue to Payment" button
2. Integrated with `/api/billing/create-checkout` endpoint
3. Modal redirects to Stripe checkout for paid tiers
4. Falls back to demo mode if Stripe is not configured

**File Changed:** `/src/components/billing/PricingPlans.tsx`

**Changes Made:**
- Added `showUpgradeModal` state to track upgrade intent
- Created `handleUpgrade()` function that calls Stripe API
- Added upgrade confirmation modal with plan benefits
- Modal includes "Continue to Payment" button with card icon
- Shows loading state during checkout session creation
- Handles both Stripe checkout (production) and demo mode (development)

**New Flow:**
1. User clicks "Upgrade" button
2. Upgrade modal appears showing plan details and benefits
3. User clicks "Continue to Payment"
4. If Stripe configured: Redirects to Stripe checkout
5. If Stripe not configured: Simulates upgrade in demo mode

---

### 4. Billing API Enhancement
**Problem:** `/api/billing/create-checkout` wasn't properly implemented for plan changes from settings.

**Fix:** Implemented full Stripe checkout session creation for plan upgrades.

**File Changed:** `/src/app/api/billing/create-checkout/route.ts`

**Features Added:**
- Validates user authentication
- Validates barn access (must be OWNER or MANAGER)
- Creates Stripe checkout session with proper metadata
- Supports monthly and annual billing cycles
- Handles demo mode when Stripe not configured
- Returns session ID and checkout URL
- Proper error handling and logging

---

## Current Flow

### Onboarding Flow (New Barns)
1. User signs up and verifies email (Clerk)
2. User navigates through barn creation wizard
3. Step 1: Basic information (barn name, address)
4. Step 2: Contact information (phone, email)
5. Step 3: **Plan selection**
   - User must explicitly select FREE, BASIC, or ADVANCED
   - No plan is pre-selected
6. If FREE selected: Barn created immediately
7. If BASIC/ADVANCED selected: Redirects to Stripe checkout
8. After payment: Barn created with selected tier

### Settings Billing Flow (Existing Barns)
1. User navigates to Settings → Billing
2. Current plan is displayed
3. User can upgrade or downgrade:
   - **Upgrade (FREE → BASIC or BASIC → ADVANCED):**
     - Click "Upgrade" button
     - Upgrade modal appears with plan benefits
     - Click "Continue to Payment"
     - Redirects to Stripe checkout
     - After payment: Plan updates
   - **Downgrade (ADVANCED → BASIC or BASIC → FREE):**
     - Click "Downgrade" button
     - Confirmation modal warns about limitations
     - Click "Confirm Downgrade"
     - Plan changes immediately (no refund in demo)

---

## Environment Setup Required

To enable Stripe payments, configure these environment variables:

```bash
# Stripe Configuration (Required for payments)
STRIPE_SECRET_KEY="sk_test_..."  # From Stripe Dashboard
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."  # For webhook handling

# App URL (Required for Stripe redirects)
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # Or your deployed URL
```

### Development Mode (Without Stripe)
If Stripe keys are not configured:
- Onboarding: Users can only create FREE tier barns
- Billing: Upgrades will show error message about Stripe not configured
- `/api/billing/create-checkout` returns demo mode response

### Production Mode (With Stripe)
With Stripe keys configured:
- Onboarding: BASIC/ADVANCED tiers redirect to Stripe checkout
- Billing: Upgrades redirect to Stripe checkout
- After payment: Plan updates automatically via webhook

---

## Testing Checklist

### Without Stripe Configured
- [ ] New users default to FREE plan
- [ ] Can create barn with FREE tier
- [ ] BASIC/ADVANCED tiers show Stripe not configured error
- [ ] Billing page shows current FREE tier
- [ ] Cannot upgrade without Stripe configured

### With Stripe Configured (Test Mode)
- [ ] New users default to FREE plan
- [ ] Can create barn with FREE tier
- [ ] BASIC tier selection redirects to Stripe
- [ ] ADVANCED tier selection redirects to Stripe
- [ ] Stripe checkout page loads correctly
- [ ] Can enter test card (4242 4242 4242 4242)
- [ ] After payment, redirects to success page
- [ ] Barn created with correct tier
- [ ] Billing page shows correct current tier
- [ ] Upgrade button opens confirmation modal
- [ ] "Continue to Payment" redirects to Stripe
- [ ] Downgrade button shows confirmation with warnings
- [ ] Downgrade completes immediately

---

## Files Modified

1. `/src/contexts/SubscriptionContext.tsx`
   - Changed default tier from BASIC to FREE

2. `/src/app/api/stripe/create-checkout/route.ts`
   - Added conditional Stripe initialization
   - Added Stripe configuration check
   - Improved error handling

3. `/src/app/api/billing/create-checkout/route.ts`
   - Implemented full Stripe checkout session creation
   - Added barn access validation
   - Added demo mode handling

4. `/src/components/billing/PricingPlans.tsx`
   - Added upgrade confirmation modal
   - Integrated Stripe checkout for upgrades
   - Added loading states
   - Imported BarnContext for barn ID

---

## Related Documentation

- [CLERK-EMAIL-TROUBLESHOOTING.md](CLERK-EMAIL-TROUBLESHOOTING.md) - Email verification setup
- [UI-UX-TEST-GUIDE.md](UI-UX-TEST-GUIDE.md) - Comprehensive testing guide
- [.env.example](.env.example) - Environment variable reference

---

## Next Steps

1. **Configure Stripe** (if not already done):
   - Sign up at [https://stripe.com](https://stripe.com)
   - Get test API keys from Dashboard
   - Add keys to `.env.local` file

2. **Test Payment Flow:**
   - Create new account
   - Go through onboarding with BASIC plan
   - Verify Stripe checkout appears
   - Use test card: `4242 4242 4242 4242`
   - Verify barn created with correct tier

3. **Test Upgrade Flow:**
   - Sign in to existing account
   - Navigate to Settings → Billing
   - Click upgrade button
   - Verify modal appears with correct details
   - Click "Continue to Payment"
   - Complete payment in Stripe
   - Verify plan updates

4. **Configure Webhooks** (for production):
   - Set up Stripe webhook endpoint
   - Listen for `checkout.session.completed` events
   - Update barn tier after successful payment

---

## Notes

- **Demo Mode:** Without Stripe configured, the app operates in demo mode where plan changes are simulated via localStorage
- **Free Tier:** Always available, no payment required
- **Paid Tiers:** Require Stripe configuration and valid payment method
- **Downgrades:** Currently immediate, consider implementing end-of-period downgrades in production
- **Webhooks:** Not yet implemented - consider adding for production to handle subscription events

