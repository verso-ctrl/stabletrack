# BarnKeep UX Polish & Testing

Work through each task below in order. Complete one fully before moving to the next. Read the relevant files before making changes. Reference CLAUDE.md for project context.

This is a test environment — no need to worry about Stripe, Sentry, Resend, or any external paid services. Focus on UI, UX, and code quality only.

---

## Task 1: Confirmation Dialog Component

**Goal:** Replace every `window.confirm()` / `confirm()` call with a proper styled confirmation modal that matches the app's design system.

**Why:** Native browser confirm dialogs are ugly, can't be styled, don't match the app's dark mode, and break the user experience. Destructive actions deserve a proper "Are you sure?" dialog with clear context.

**Files to create:**
- `src/components/ui/ConfirmDialog.tsx` — reusable confirmation dialog component

**Files to update (replace `confirm()` calls):**
- `src/app/(dashboard)/team/page.tsx` — lines 110, 166 (reject request, remove member)
- `src/app/(dashboard)/pastures/page.tsx` — lines 266, 398 (delete paddock, delete stall)
- `src/app/(dashboard)/documents/page.tsx` — line 172 (delete document)
- `src/app/(dashboard)/settings/barn/page.tsx` — line 142 (regenerate invite code)
- `src/app/(dashboard)/clients/page.tsx` — line 723 (remove payment method)
- `src/components/storage/HorsePhotoGallery.tsx` — line 122 (delete photo)
- `src/components/storage/DocumentManager.tsx` — line 133 (delete document)

**What to do:**
- Build `ConfirmDialog` using Radix UI's `AlertDialog` primitive (already a dependency — check `@radix-ui/react-alert-dialog`)
  - If Radix AlertDialog is not installed, use a simple modal with backdrop, focus trap, and Escape-to-close
- Props: `open`, `onConfirm`, `onCancel`, `title`, `description`, `confirmLabel` (default "Confirm"), `cancelLabel` (default "Cancel"), `variant` ("danger" | "warning" | "default")
- Danger variant: red confirm button (for deletes/removes)
- Warning variant: amber confirm button (for regenerating codes, etc.)
- Must support dark mode (use existing CSS variable colors: `bg-card`, `text-foreground`, etc.)
- Must trap focus and close on Escape
- Replace every `confirm()` call in the codebase with the new component — each page will need local `useState` for dialog open/closed state and a pending action callback
- Make sure the dialog shows context-specific messaging (e.g. "Remove Sarah from the barn?" not just "Are you sure?")

---

## Task 2: Custom 404 & Error Pages

**Goal:** Add branded 404 and error pages so users don't see raw Next.js defaults when they hit a bad URL or a page crashes.

**Files to create:**
- `src/app/not-found.tsx` — global 404 page
- `src/app/(dashboard)/not-found.tsx` — dashboard-specific 404
- `src/app/(dashboard)/error.tsx` — dashboard error boundary
- `src/app/(dashboard)/horses/[horseId]/not-found.tsx` — horse not found

**What to do:**

### 404 Pages
- Design a simple, friendly 404 page matching the app's style:
  - Horse-themed illustration or icon (use an SVG or lucide icon)
  - "Page not found" heading
  - Helpful message: "This page doesn't exist or has been moved."
  - "Go to Dashboard" button linking to `/dashboard`
  - "Go Home" link for the public 404
- The dashboard 404 should render inside the dashboard layout (sidebar stays visible)
- The horse-specific 404 should say "Horse not found" with a link back to `/horses`

### Error Boundary (`error.tsx`)
- Must be a client component (`'use client'`)
- Show a friendly error message: "Something went wrong"
- Include a "Try again" button that calls the `reset()` function from Next.js error boundary props
- Include a "Go to Dashboard" fallback link
- Log the error to console (Sentry integration exists but don't worry about it for now)
- Style to match the app — use `bg-card`, `text-foreground`, `border-border` tokens

---

## Task 3: Toast Feedback on All CRUD Operations

**Goal:** Ensure every create, update, and delete operation gives the user visible feedback via toast notifications.

**Current state:** The toast system works — `ToastContainer` is rendered in the dashboard layout, and `toast.success()` / `toast.error()` from `src/lib/toast.ts` fire correctly. But most mutations in `src/hooks/useMutations.ts` silently succeed without telling the user.

**Files to update:**
- `src/hooks/useMutations.ts` — add toast calls to all mutation `onSuccess` and `onError` callbacks

**What to do:**
- Import `toast` and `showError` from `@/lib/toast`
- Add success toasts to every mutation's `onSuccess`:
  - `useCreateHorse` → `toast.success('Horse added', 'Successfully added to your barn')`
  - `useUpdateHorse` → `toast.success('Horse updated')`
  - `useDeleteHorse` → `toast.success('Horse removed')`
  - `useCreateEvent` → `toast.success('Event created')`
  - `useUpdateEvent` → `toast.success('Event updated')`
  - `useDeleteEvent` → `toast.success('Event deleted')`
  - `useCreateTask` → `toast.success('Task created')`
  - `useUpdateTask` → `toast.success('Task updated')`
  - `useDeleteTask` → `toast.success('Task deleted')`
  - `useCompleteTask` → `toast.success('Task completed')`
  - `useCreateClient` → `toast.success('Client added')`
  - `useUpdateClient` → `toast.success('Client updated')`
  - `useDeleteClient` → `toast.success('Client removed')`
  - `useCreateInvoice` → `toast.success('Invoice created')`
  - `useUpdateInvoice` → `toast.success('Invoice updated')`
  - `useDeleteInvoice` → `toast.success('Invoice deleted')`
  - `useCreateLesson` → `toast.success('Lesson scheduled')`
  - `useUpdateLesson` → `toast.success('Lesson updated')`
  - `useDeleteLesson` → `toast.success('Lesson removed')`
- Add error toasts to every mutation's `onError`:
  - Use `showError(error, 'Failed to [action]')` for each
- Keep existing `onSuccess` logic (cache invalidation) — just add the toast call alongside it
- Do NOT add toasts to `useCompleteEvent` if it already shows feedback in the UI

---

## Task 4: Breadcrumbs Navigation

**Goal:** Add breadcrumb navigation to detail pages and settings sub-pages so users always know where they are and can navigate back easily.

**Files to create:**
- `src/components/ui/Breadcrumbs.tsx` — reusable breadcrumb component

**Files to update:**
- `src/app/(dashboard)/horses/[horseId]/page.tsx` — add breadcrumbs: Dashboard > Horses > [Horse Name]
- `src/app/(dashboard)/settings/barn/page.tsx` — add breadcrumbs: Dashboard > Settings > Barn
- `src/app/(dashboard)/settings/billing/page.tsx` — add breadcrumbs: Dashboard > Settings > Billing
- `src/app/(dashboard)/settings/profile/page.tsx` — add breadcrumbs: Dashboard > Settings > Profile
- `src/app/(dashboard)/settings/security/page.tsx` — add breadcrumbs: Dashboard > Settings > Security
- `src/app/(dashboard)/settings/notifications/page.tsx` — add breadcrumbs: Dashboard > Settings > Notifications
- `src/app/(dashboard)/settings/appearance/page.tsx` — add breadcrumbs: Dashboard > Settings > Appearance
- `src/app/(dashboard)/documents/page.tsx` — if it has a detail view

**What to do:**
- Build a `Breadcrumbs` component:
  - Props: `items: Array<{ label: string; href?: string }>` — last item has no href (current page)
  - Render as `<nav aria-label="Breadcrumb">` with an `<ol>` for accessibility
  - Use `>` or `/` as separator between items
  - Links use `text-muted-foreground hover:text-foreground`, current page uses `text-foreground font-medium`
  - Responsive: on mobile, show only the parent link as a back arrow ("< Horses") instead of full breadcrumb trail
- Add breadcrumbs at the top of each detail/settings page, above the page heading
- The horse detail page should show the horse's name as the last breadcrumb item

---

## Task 5: Accessibility Improvements

**Goal:** Fix the most impactful accessibility gaps so the app is usable with screen readers and keyboard navigation.

**Files to update:**
- `src/components/dashboard/Sidebar.tsx` — skip-to-content link, aria labels
- `src/app/(dashboard)/layout.tsx` or `src/components/dashboard/DashboardShell.tsx` — landmark roles, skip link target
- `src/app/(dashboard)/horses/[horseId]/page.tsx` — tab navigation accessibility
- Any modal/dialog components — focus management

**What to do:**

### Skip-to-Content Link
- Add a "Skip to main content" link as the first focusable element in the dashboard layout
- Visually hidden until focused (use `sr-only focus:not-sr-only` pattern)
- Links to `#main-content` — add `id="main-content"` to the main content area

### Aria Labels on Icon Buttons
- Audit all icon-only buttons (no visible text) and add `aria-label` attributes
- Key places to check:
  - Sidebar toggle/hamburger button
  - Theme toggle button
  - Horse card action buttons (edit, delete)
  - Modal close buttons (X icon)
  - Table action menus (three-dot MoreVertical buttons)
  - Photo gallery action buttons (set primary, download, delete)
  - Calendar navigation arrows (prev/next month)

### Focus Indicators
- Ensure all interactive elements have visible focus indicators
- Add `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` to any custom button/link styles that lack them
- Check: sidebar nav items, card action buttons, form inputs

### Tab Panel Accessibility
- On the horse detail page, if tabs are used (Overview, Health, Tasks, etc.):
  - Add `role="tablist"` to the tab container
  - Add `role="tab"`, `aria-selected`, `aria-controls` to each tab button
  - Add `role="tabpanel"`, `id`, `aria-labelledby` to each panel
  - Support arrow key navigation between tabs

---

## Task 6: Form Validation UX

**Goal:** Show inline field-level errors on forms so users can see exactly what's wrong without hunting.

**Files to update:**
- `src/components/horses/AddHorseForm.tsx` — inline errors under each field
- `src/components/events/EventForm.tsx` — inline errors
- `src/app/onboarding/create-barn/page.tsx` — inline errors on onboarding form

**What to do:**
- For React Hook Form fields (AddHorseForm):
  - Below each input, add an error message span: `{errors.fieldName && <p className="text-sm text-destructive mt-1">{errors.fieldName.message}</p>}`
  - Add `aria-invalid={!!errors.fieldName}` and `aria-describedby` to the input
  - Add a red border on errored inputs: `border-destructive` when error is present
- For the EventForm (native form handling):
  - Add local validation state and show errors inline under each field
  - Validate required fields (title, date) before submission
  - Show specific messages: "Event title is required", "Please select a date"
- For create-barn onboarding:
  - Barn name: "Barn name is required"
  - Contact fields: validate email format, phone format
  - Show errors inline under each field, not just in a banner at the top
- All error messages should use `role="alert"` or `aria-live="polite"` for screen reader announcement

---

## Task 7: Unit & Integration Tests

**Goal:** Add meaningful test coverage for the core utilities, hooks, and key components. Target the highest-value, most testable code first.

**Current state:** Only 3 test files exist:
- `src/lib/__tests__/api-helpers.test.ts` — rate limiting, ValidationError
- `src/lib/__tests__/validations.test.ts` — Zod schemas
- `src/components/__tests__/ErrorBoundary.test.tsx` — error boundaries

**Test framework:** Jest 30.2.0 + React Testing Library 16.3.1. Run with `npm run test`.

**Files to create:**

### Tier System Tests
- `src/lib/__tests__/tiers.test.ts`
  - `normalizeTier()` maps all legacy strings correctly: FREE → CORE, BASIC → CORE, ADVANCED → PRO, ENTERPRISE → PRO, garbage → CORE
  - `getNextTier()` returns PRO for CORE, null for PRO
  - `getTierLimits()` returns correct limits for each tier (maxHorses, maxStorageBytes, etc.)
  - `getTierPricing()` returns correct prices
  - `getTierFeatures()` returns correct feature flags
  - `hasReachedPhotoLimit()` correctly checks limits
  - `formatBytes()` formats bytes correctly (0, KB, MB, GB)

### Toast Utility Tests
- `src/lib/__tests__/toast.test.ts`
  - `subscribeToToasts()` receives emitted toasts
  - `toast.success()`, `toast.error()`, etc. emit correct types
  - `showError()` extracts Error messages and falls back to default
  - `showDemoMessage()` emits info toast with correct content
  - Unsubscribe function stops receiving toasts

### CSV Utility Tests (if `src/lib/csv.ts` exists)
- `src/lib/__tests__/csv.test.ts`
  - Generates correct CSV output from array of objects
  - Handles special characters (commas, quotes, newlines) in values
  - Handles empty arrays
  - Handles custom column definitions

### Tier Validation Tests
- `src/lib/__tests__/tier-validation.test.ts`
  - `validateBarnAction()` or equivalent functions enforce limits correctly
  - Horse count checks respect maxHorses per tier
  - Storage checks respect maxStorageBytes per tier

### Component Tests
- `src/components/__tests__/ConfirmDialog.test.tsx` (after Task 1)
  - Renders with title and description
  - Calls onConfirm when confirm button clicked
  - Calls onCancel when cancel button or backdrop clicked
  - Closes on Escape key
  - Shows danger styling for variant="danger"

- `src/components/__tests__/Breadcrumbs.test.tsx` (after Task 4)
  - Renders all breadcrumb items
  - Last item is not a link
  - Has correct aria-label on nav element
  - Links have correct href attributes

### Hook Tests
- `src/hooks/__tests__/useTierPermissions.test.tsx`
  - Returns correct permissions for CORE tier
  - Returns correct permissions for PRO tier
  - `canAddHorses()` respects tier limits
  - `canAddTeamMembers()` respects tier limits
  - `getUpgradeMessage()` returns appropriate messages

**What to do:**
- Create each test file with the tests described above
- Use `describe` / `it` blocks with clear test names
- For component tests, use `@testing-library/react` render + screen queries
- For hook tests, use `renderHook` from `@testing-library/react`
- Mock external dependencies (Prisma, fetch, contexts) as needed
- Run `npm run test` after each file to verify tests pass
- Do NOT fix pre-existing test failures in `ErrorBoundary.test.tsx` (known issues — see CLAUDE.md memory)
- Target: all new tests should pass green
