# StableTrack Feature Implementation

Work through each task below in order. Complete one fully before moving to the next. Read the relevant files before making changes. Reference CLAUDE.md for project context.

This is a test environment — no need to worry about Stripe, Sentry, Resend, or any external paid services. Focus on UI, UX, and code quality only.

---

## Task 1: Horse-Specific Tasks & Two-Way Schedule Sync

**Goal:** Allow users to create tasks under individual horse profiles that automatically sync to the master calendar, and vice versa — global schedule entries should appear under each affected horse's profile.

**Key behaviors:**
- Under each horse's profile page, add the ability to create tasks specific to that horse (e.g. brush mane and tail, pick feet, dentist appointment, farrier visit)
- Horse-specific tasks should automatically appear on the master schedule/calendar
- When a global entry is made on the schedule (e.g. vet coming to check coggins, prepare health certificate) and one or more horses are tagged, that entry should also appear under each affected horse's profile
- This must be a **two-way sync**: horse-level → master schedule, and master schedule → horse profile

**Files to check/update:**
- `src/app/(dashboard)/horses/[horseId]/page.tsx` — horse detail page, add a tasks section
- `src/app/(dashboard)/horses/[horseId]/components/` — may need a new TasksTab or similar
- `src/app/(dashboard)/calendar/page.tsx` — ensure horse-linked events show horse context
- `src/app/(dashboard)/daily-care/page.tsx` — check overlap with task management
- `src/components/events/EventForm.tsx` — ensure events can be linked to one or more horses
- `src/hooks/useData.ts` — may need hooks for horse-specific tasks
- `prisma/schema.prisma` — verify Task and Event models have horse relationships
- Relevant API routes under `src/app/api/barns/[barnId]/`

**What to do:**
- Check the existing Task and Event models in the Prisma schema — do they already have a `horseId` field? If not, add one
- On the horse detail page, add a "Tasks" or "Schedule" section that lists all tasks and events linked to that horse
- Allow creating new tasks directly from the horse profile (quick-add form or modal)
- On the calendar/schedule page, when creating or viewing an event, show which horse(s) it's linked to
- When a global event is created with horses selected, it should appear in each horse's profile view
- Ensure task completion status syncs everywhere (mark done on calendar → shows done on horse profile, and vice versa)

---

## Task 2: Printable Monthly Calendar

**Goal:** Provide a downloadable/printable full-month calendar view where activities appear inside the day squares, designed to be posted in the tack room.

**Files to check/update:**
- `src/app/(dashboard)/calendar/page.tsx` — main calendar page
- `src/components/events/CalendarView.tsx` — calendar rendering component
- May need a new `PrintableCalendar.tsx` component

**What to do:**
- Add a "Print" or "Download" button on the calendar page
- Create a print-optimized monthly calendar layout:
  - Full month grid with day squares large enough to fit text
  - Activities/events listed inside each day square (not in a side panel)
  - Show both horse-specific and global entries
  - Include the month/year as a header
  - Use `@media print` CSS for clean print output, or generate a PDF
- Events in day squares should show a brief summary (event title, horse name if applicable)
- If a day has too many events to fit, show a count like "+3 more"
- The calendar should be legible when printed on standard letter paper (landscape orientation recommended)
- Consider using the existing pdf-lib or pdfkit dependencies for PDF generation, or use CSS print styles for browser print

---

## Task 3: Separate Farm Maintenance from Daily Care

**Goal:** Split "Daily Care" into two distinct sections — horse-specific daily care (feeding, meds, turnout) and general farm maintenance (property upkeep not tied to a specific horse).

**Files to check/update:**
- `src/app/(dashboard)/daily-care/page.tsx` — current daily care page
- May need a new `src/app/(dashboard)/farm-maintenance/page.tsx` page
- `src/components/dashboard/Sidebar.tsx` — add Farm Maintenance nav item
- `prisma/schema.prisma` — may need a FarmTask model or a type field on existing Task model
- Relevant API routes

**What to do:**

### Farm Maintenance (new section)
- Create a new "Farm Maintenance" tab/page in the dashboard navigation
- Farm tasks are NOT tied to a specific horse — they're property-level chores
- Examples: fix fence boards, clean water troughs, spread manure in pastures, mow fields, repair barn doors
- Support creating, completing, and scheduling farm maintenance tasks
- Allow recurring tasks (e.g. "clean water troughs" every week)

### Daily Care (refocused on horse-specific care)
- Refocus the existing Daily Care page to be strictly horse-specific care:
  - **Medications**: frequency (# times/day), form (pill/liquid/paste), dosage amount
  - **Special dietary needs**: notes per horse
  - **Hay/feed**: type (timothy, alfalfa, T&A, coastal, etc.), amount, number of times daily
  - **Turnout schedule**: time out, duration, which pasture/paddock
- Each of these should be viewable per individual horse (on the horse profile)
- Also provide a **master daily care printout**: all horses listed alphabetically by name, showing each horse's care instructions — designed to be printed and posted for easy reference

---

## Task 4: Client Payment Information

**Goal:** Allow storing payment methods on file for clients, with proper consent and security.

**Files to check/update:**
- `src/app/(dashboard)/clients/page.tsx` — clients list and detail
- `src/app/api/barns/[barnId]/clients/` — client API routes
- `prisma/schema.prisma` — Client model
- `src/lib/` — may need payment utility functions

**What to do:**
- Under each client's profile, add a "Payment Method" section
- Support storing payment method references:
  - Credit/debit card (via Stripe tokenization — never store raw card numbers)
  - ACH / bank account (via Stripe tokenization)
- Add a consent/permission checkbox: "Client has authorized storing payment information on file"
- Display masked payment info (e.g. "Visa ending in 4242", "Bank account ending in 6789")
- Allow updating or removing a stored payment method
- For this test environment, build the UI and data flow but use Stripe test mode or mock the payment token storage
- **Security**: Never store raw card numbers, CVVs, or full bank account numbers in the database. Only store Stripe payment method IDs/tokens. Follow PCI compliance patterns.
