# BarnKeep Feature Requests & Status

## Completed

- [x] **Marketing & Pricing page** — Rewritten for single $25/mo core plan + add-ons
- [x] **Onboarding Welcome Checklist** — Dismissible checklist for new barns, auto-dismisses when all items complete
- [x] **Next.js `<Image>` migration** — All `<img>` tags replaced with `next/image` across entire codebase
- [x] **Dark mode** — ThemeProvider, ThemeToggle (sidebar), CSS variable system, anti-flash script
- [x] **Dark mode color fix** — Replaced ~2,400 hardcoded stone/white color classes with semantic CSS variables across 71 files; brightened dark palette; fixed dashboard alert boxes and icon backgrounds for dark mode
- [x] **Pagination** — Reusable Pagination component, wired up on horses page
- [x] **SEO basics** — OG/Twitter metadata, robots.txt, sitemap.ts
- [x] **CSV exports** — Generic `toCsv()` utility, export button on horses page
- [x] **Empty states** — Reusable EmptyState component for log pages, calendar, team

---

## Requested — Not Yet Started

### 1. Horse-Specific Tasks & Schedule Sync
- Under each horse's profile, allow creating tasks specific to that horse (e.g. brush mane and tail, pick feet, dentist appointment)
- When a task is created under a horse, it should automatically appear on the master schedule/calendar
- When a global entry is made on the schedule (e.g. vet coming for coggins, health certificates), it should also appear under each affected horse's profile
- **Two-way sync**: horse-level entries populate the master schedule, and schedule-level entries populate the horse profile

### 2. Printable Monthly Calendar
- Under the schedule/calendar tab, provide a downloadable/printable full-month calendar view
- Activities should appear inside the day squares (not just visible after clicking a day)
- Designed to be printed and posted in the tack room for everyone to see
- Should show both horse-specific and global entries in one view

### 3. Separate "Farm Maintenance" from "Daily Care"
- **Farm Maintenance** (new tab or section): fix fence boards, clean water troughs, spread manure in pastures, general property upkeep — not tied to a specific horse
- **Daily Care** (refocused): horse-specific care only:
  - Medications: frequency (# times/day), form (pill/liquid/paste), dosage
  - Special dietary needs
  - Hay: type (timothy, alfalfa, T&A, coastal, etc.), amount, frequency
  - Turnout schedule: time out, duration
- Daily care info should be viewable per horse, plus a master printout of all horses (alphabetical by name) for posting as a quick reference

### 4. Client Payment Information
- Under the clients tab, add the ability to store a payment method on file
- With appropriate permission/consent, keep payment info on hand (ACH details, credit card info, etc.)
- Must handle sensitive payment data securely (likely via Stripe tokenization — never store raw card/bank numbers)
