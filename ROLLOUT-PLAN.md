# BarnKeep Launch Rollout Plan

**Target Launch Date:** May 1, 2026
**Document Created:** February 8, 2026
**Timeline:** 12 weeks (Feb 10 - May 1)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Assessment](#2-current-state-assessment)
3. [Pre-Launch Phases](#3-pre-launch-phases)
4. [Infrastructure & Deployment](#4-infrastructure--deployment)
5. [Testing Strategy](#5-testing-strategy)
6. [Security Audit](#6-security-audit)
7. [Marketing & Go-to-Market](#7-marketing--go-to-market)
8. [Beta Program](#8-beta-program)
9. [Launch Week Plan](#9-launch-week-plan)
10. [Post-Launch Plan](#10-post-launch-plan)
11. [Risk Register](#11-risk-register)
12. [Budget Estimates](#12-budget-estimates)
13. [Key Milestones & Timeline](#13-key-milestones--timeline)

---

## 1. Executive Summary

BarnKeep is a barn management SaaS for small horse farms, priced at $25/month (CORE plan) with optional add-ons for lessons and training. The application is feature-complete with 19 dashboard sections, 57+ API endpoints, and 42 database models covering horse management, health tracking, scheduling, invoicing, and team collaboration.

**Launch goal:** Onboard 50 paying barns within the first 30 days post-launch.

**What's done:** All core features, dark mode, CSV exports, SEO basics, Stripe billing, role-based auth, mobile shell (Capacitor), Railway deployment config.

**What remains:** UI polish (7 tasks), test coverage, production infrastructure setup, monitoring, marketing site finalization, and beta testing.

---

## 2. Current State Assessment

### Completed (Ready for Production)
| Area | Status | Notes |
|------|--------|-------|
| Horse management | Done | Profiles, photos, health records, medications, vaccinations |
| Feed tracking | Done | Feed programs, feed logs, feed chart visualization |
| Daily care & health checks | Done | Vitals, observations, water logs, print care sheets |
| Calendar & scheduling | Done | Events, multi-horse, printable monthly view, iCal export |
| Task management | Done | Global + horse-specific, farm maintenance separated |
| Client management | Done | Profiles, payment methods (Stripe), client portal |
| Invoicing & billing | Done | Line items, recurring invoices, PDF generation, payment links |
| Lessons & training | Done | Add-on features: scheduling, logs, competitions |
| Team & permissions | Done | 5 roles (Owner/Manager/Trainer/Caretaker/Client) |
| Authentication | Done | Clerk integration + demo mode fallback |
| Dark mode | Done | CSS class strategy, localStorage persistence |
| SEO | Done | OG/Twitter metadata, robots.txt, sitemap.ts |
| CSV export | Done | Horses page export |
| Security | Done | Rate limiting, CSRF, input sanitization, security headers |
| Deployment config | Done | Railway (nixpacks.toml, railway.json, deploy script) |

### Remaining Work (Pre-Launch)
| Task | Priority | Est. Effort | Phase |
|------|----------|-------------|-------|
| Confirmation dialogs (replace `window.confirm`) | High | 1 day | Polish |
| Custom 404 & error pages | High | 1 day | Polish |
| Toast notifications on all CRUD ops | Medium | 2 days | Polish |
| Breadcrumbs navigation | Medium | 1 day | Polish |
| Accessibility audit (ARIA, keyboard nav) | High | 3 days | Polish |
| Form validation UX (inline errors) | Medium | 2 days | Polish |
| Unit & integration tests | High | 5 days | Testing |
| Production database setup | Critical | 1 day | Infra |
| Monitoring & error tracking (Sentry) | Critical | 1 day | Infra |
| Email/notification system | High | 3 days | Infra |
| Stripe production keys & webhooks | Critical | 1 day | Infra |
| Custom domain & SSL | Critical | 1 day | Infra |
| README & developer docs | Low | 1 day | Docs |

---

## 3. Pre-Launch Phases

### Phase 1: Polish & Hardening (Feb 10 - Mar 7) — 4 weeks

**Week 1-2: UI/UX Polish**
- [ ] Build `ConfirmDialog` component (replace all `window.confirm()` calls)
- [ ] Create custom 404 page (`not-found.tsx`) and error page (`error.tsx`)
- [ ] Add toast notifications (`sonner` or custom) to all CRUD operations
- [ ] Add breadcrumb navigation to all dashboard pages
- [ ] Inline form validation with field-level error messages

**Week 3: Accessibility**
- [ ] Audit all interactive elements for ARIA labels and roles
- [ ] Ensure full keyboard navigation (tab order, focus traps in modals)
- [ ] Test with screen reader (VoiceOver on macOS)
- [ ] Color contrast check (WCAG 2.1 AA minimum)
- [ ] Add skip-to-content link

**Week 4: Code Quality**
- [ ] Write unit tests for utility modules (`tiers.ts`, `toast.ts`, `csv.ts`, `sanitize.ts`)
- [ ] Write integration tests for critical API routes (horses CRUD, invoicing, auth)
- [ ] Write component tests for key UI (ConfirmDialog, Breadcrumbs, Pagination)
- [ ] Fix any non-preexisting TypeScript errors (`npm run type-check`)
- [ ] Run full lint pass (`npm run lint`)

### Phase 2: Infrastructure & Integrations (Mar 8 - Mar 28) — 3 weeks

**Week 5: Production Database**
- [ ] Provision production PostgreSQL on Supabase (or Railway Postgres)
- [ ] Run `prisma db push` against production database
- [ ] Seed production database with demo barn for testing
- [ ] Set up database backups (daily automated, 30-day retention)
- [ ] Configure connection pooling (PgBouncer via Supabase)

**Week 6: Production Services**
- [ ] Register production domain (e.g., `barnkeep.com` or `getbarnkeep.com`)
- [ ] Configure DNS + SSL certificate (auto via Railway or Cloudflare)
- [ ] Set up Stripe production account
  - [ ] Complete Stripe business verification
  - [ ] Configure production API keys
  - [ ] Set up webhook endpoint (`/api/webhooks/stripe`)
  - [ ] Test checkout flow end-to-end with real card
  - [ ] Configure Stripe Tax (if applicable)
- [ ] Set up Clerk production instance
  - [ ] Configure production API keys
  - [ ] Set allowed redirect URLs for production domain
  - [ ] Customize Clerk sign-in/sign-up branding
- [ ] Set up Supabase Storage bucket for production file uploads

**Week 7: Monitoring & Operations**
- [ ] Integrate Sentry for error tracking (Next.js SDK)
  - [ ] Server-side error capture
  - [ ] Client-side error boundary integration
  - [ ] Source map uploads in build pipeline
- [ ] Set up uptime monitoring (UptimeRobot, Better Stack, or similar)
  - [ ] Monitor `/api/health` endpoint
  - [ ] Alert via email + SMS on downtime
- [ ] Configure logging (Railway built-in or Axiom/Logflare)
- [ ] Set up email delivery service (Resend, SendGrid, or Postmark)
  - [ ] Transactional emails: welcome, password reset, invoice sent
  - [ ] Event reminders (vet visits, farrier, vaccinations due)
  - [ ] Configure SPF/DKIM/DMARC for deliverability
- [ ] Create runbook for common operational tasks

### Phase 3: Beta Testing (Mar 29 - Apr 18) — 3 weeks

**Week 8: Internal Beta (Dogfooding)**
- [ ] Deploy to production environment with staging flag
- [ ] Team uses app daily with real (test) data
- [ ] Document all bugs and UX issues
- [ ] Stress test: create 50 horses, 200 events, 100 invoices
- [ ] Test all user roles (Owner, Manager, Trainer, Caretaker, Client)
- [ ] Test client portal flow end-to-end
- [ ] Test mobile experience (iOS Safari, Android Chrome)

**Week 9-10: Closed Beta (5-10 barns)**
- [ ] Recruit beta testers from equestrian communities
- [ ] Provide beta testers free 90-day access
- [ ] Set up feedback channel (Discord, email, or in-app)
- [ ] Weekly check-in calls with beta barns
- [ ] Track and prioritize bug reports
- [ ] Monitor error rates in Sentry
- [ ] Gather testimonials and feature feedback

### Phase 4: Launch Prep (Apr 19 - Apr 30) — 2 weeks

**Week 11: Final Polish**
- [ ] Fix all critical/high-priority bugs from beta
- [ ] Performance audit (Lighthouse score target: 90+ on all metrics)
- [ ] Final security review (see Section 6)
- [ ] Load test API endpoints (target: 100 concurrent users)
- [ ] Verify all environment variables are set in production
- [ ] Test Stripe subscription lifecycle (create, upgrade add-on, cancel)
- [ ] Test data export (CSV, PDF invoices, iCal)
- [ ] Verify demo mode is disabled in production (`DISABLE_DEMO_MODE=true`)

**Week 12: Launch Prep**
- [ ] Finalize marketing site copy and screenshots
- [ ] Prepare launch announcement (email, social media)
- [ ] Create onboarding documentation / help center
- [ ] Record product walkthrough video (3-5 min)
- [ ] Set up customer support email (support@barnkeep.com)
- [ ] Prepare launch-day monitoring dashboard
- [ ] Dry-run deployment (deploy, verify, rollback, redeploy)
- [ ] Brief any support/team members on launch procedures

---

## 4. Infrastructure & Deployment

### Production Architecture

```
                    ┌─────────────┐
                    │  Cloudflare  │  DNS, SSL, CDN, DDoS protection
                    │    (edge)    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Railway    │  Next.js app (Node.js 20)
                    │   (compute)  │  Auto-scaling, health checks
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌──▼───┐ ┌──────▼──────┐
       │   Supabase   │ │Stripe│ │    Clerk     │
       │  PostgreSQL   │ │  API │ │    Auth      │
       │  + Storage    │ │      │ │              │
       └──────────────┘ └──────┘ └──────────────┘
```

### Environment Variable Checklist (Production)

```bash
# App
NEXT_PUBLIC_APP_URL=https://barnkeep.com
DISABLE_DEMO_MODE=true
NODE_ENV=production

# Clerk (Production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding/create-barn

# Database (Supabase Production)
DATABASE_URL=postgresql://...@db.xxx.supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...@db.xxx.supabase.co:5432/postgres

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe (Production)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...

# Email
RESEND_API_KEY=re_...
```

### Deployment Process

```bash
# 1. Pre-deploy checks
npm run type-check && npm run lint && npm run test:ci

# 2. Deploy to Railway
railway up --detach

# 3. Run migrations (if schema changed)
railway run npx prisma db push

# 4. Verify health
curl https://barnkeep.com/api/health

# 5. Smoke test critical paths
# - Sign up flow
# - Create barn
# - Add horse
# - Create invoice
# - Process payment
```

### Rollback Procedure

```bash
# Railway supports instant rollback to previous deployment
railway rollback

# If database migration needs reversal:
# 1. Identify breaking migration
# 2. Create reverse migration SQL
# 3. Apply via: railway run npx prisma db execute --file ./rollback.sql
```

---

## 5. Testing Strategy

### Test Pyramid

```
         ╱╲
        ╱ E2E ╲         5-10 critical user journeys
       ╱────────╲
      ╱Integration╲     API route tests, DB operations
     ╱──────────────╲
    ╱   Unit Tests    ╲  Utilities, helpers, validators
   ╱────────────────────╲
```

### Unit Tests (Target: 80% coverage on utilities)

| Module | File | Priority |
|--------|------|----------|
| Tier system | `src/lib/__tests__/tiers.test.ts` | High |
| CSV export | `src/lib/__tests__/csv.test.ts` | High |
| Sanitization | `src/lib/__tests__/sanitize.test.ts` | High |
| Date helpers | `src/lib/__tests__/date-helpers.test.ts` | Medium |
| Permissions | `src/lib/__tests__/permissions.test.ts` | High |
| Rate limiting | Already exists | Done |
| Validation schemas | Already exists | Done |

### Integration Tests (Target: Cover all CRUD paths)

| Area | File | Priority |
|------|------|----------|
| Horse CRUD | `src/app/api/barns/[barnId]/horses/__tests__/route.test.ts` | Critical |
| Invoice lifecycle | `src/app/api/barns/[barnId]/invoices/__tests__/route.test.ts` | Critical |
| Task CRUD | `src/app/api/barns/[barnId]/tasks/__tests__/route.test.ts` | High |
| Auth & permissions | `src/lib/__tests__/auth.test.ts` | Critical |
| Stripe webhooks | `src/app/api/webhooks/__tests__/stripe.test.ts` | Critical |

### E2E Tests (Playwright — post-launch stretch goal)

| Journey | Steps |
|---------|-------|
| New user onboarding | Sign up → Create barn → Add first horse → View dashboard |
| Daily care workflow | Log feed → Record health check → Complete tasks |
| Billing cycle | Create invoice → Send to client → Record payment |
| Client portal | Client login → View horses → Pay invoice |
| Team collaboration | Invite member → Assign role → Verify permissions |

### Manual QA Checklist (Pre-Launch)

- [ ] All 19 dashboard pages load without errors
- [ ] Create, read, update, delete operations work for all entities
- [ ] File upload (horse photos, documents) works
- [ ] PDF invoice generation works
- [ ] iCal export produces valid calendar file
- [ ] CSV export produces valid spreadsheet
- [ ] Dark mode renders correctly on all pages
- [ ] Mobile responsive layout on iPhone SE, iPad, Android
- [ ] Pagination works on horses list
- [ ] Empty states display correctly when no data exists
- [ ] Onboarding flow completes successfully for new users
- [ ] Stripe checkout creates active subscription
- [ ] Stripe customer portal allows subscription management
- [ ] Client portal shows correct data for assigned horses

---

## 6. Security Audit

### Already Implemented
- [x] Rate limiting (30 writes/min, 10 uploads/min)
- [x] CSRF token validation on mutating requests
- [x] Input sanitization (XSS, injection prevention)
- [x] Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- [x] Role-based access control with barn-scoped queries
- [x] Clerk handles authentication (passwords, sessions, MFA)

### Pre-Launch Security Checklist
- [ ] Verify all API routes check authentication
- [ ] Verify all API routes check barn membership/permissions
- [ ] Audit file upload endpoint for type/size restrictions
- [ ] Ensure no sensitive data in client-side bundles (check `NEXT_PUBLIC_*` vars)
- [ ] Verify Stripe webhook signature validation
- [ ] Test rate limiter under load
- [ ] Check for exposed debug endpoints or dev-only routes
- [ ] Review `robots.txt` — ensure admin/API paths are disallowed
- [ ] Run `npm audit` and resolve critical vulnerabilities
- [ ] Verify `DISABLE_DEMO_MODE=true` in production
- [ ] Ensure database connection uses SSL in production
- [ ] Review CORS configuration
- [ ] Test authentication edge cases (expired session, invalid token)

---

## 7. Marketing & Go-to-Market

### Target Audience
- **Primary:** Small horse farms (5-30 horses), barn owners/managers
- **Secondary:** Lesson barns, training facilities, boarding operations
- **Geography:** US and Canada (English-speaking markets)

### Pricing
| Plan | Price | Includes |
|------|-------|----------|
| CORE | $25/month | Horse management, scheduling, tasks, health tracking, invoicing, team (up to 5), client portal, 2GB storage |
| Lessons Add-on | +$10/month | Lesson scheduling, instructor management |
| Training Add-on | +$10/month | Training logs, competition tracking |

**Free 14-day trial, no credit card required.**

### Marketing Channels

| Channel | Action | Timeline | Budget |
|---------|--------|----------|--------|
| Landing page | Finalize copy, testimonials, screenshots | Apr 1-15 | $0 |
| Product Hunt | Prepare launch post, schedule for May 1 | Apr 15-30 | $0 |
| Equestrian Facebook groups | Soft launch posts, beta invites | Mar 15+ | $0 |
| Google Ads | "barn management software" keywords | May 1+ | $500/mo |
| Instagram/TikTok | Horse management tips, app demos | Apr 1+ | $200/mo |
| Equestrian forums (COTH, etc.) | Community posts, offer beta access | Mar 15+ | $0 |
| Email outreach | Direct outreach to barn owners | Apr 1+ | $0 |
| Local tack shops / feed stores | Flyers, business cards | Apr 15+ | $100 |

### Launch Day Announcements
- [ ] Product Hunt submission (schedule for 12:01 AM PT May 1)
- [ ] Social media posts (Instagram, Facebook, TikTok)
- [ ] Email blast to beta testers and waitlist
- [ ] Post in equestrian Facebook groups and forums
- [ ] Personal outreach to 20 barn owners

### Marketing Site Content
- [ ] Hero section with screenshot and value prop
- [ ] Feature showcase (6-8 key features with screenshots)
- [ ] Pricing table (simple, single plan + add-ons)
- [ ] Testimonials from beta testers (minimum 3)
- [ ] FAQ section (8-10 common questions)
- [ ] "Built for small farms" positioning
- [ ] Mobile app preview (coming soon)
- [ ] Trust signals (SSL, Stripe security, data encryption)

---

## 8. Beta Program

### Timeline
- **Mar 15:** Open beta applications (landing page form)
- **Mar 29 - Apr 4:** Internal beta (team only)
- **Apr 5 - Apr 18:** Closed beta (5-10 external barns)
- **Apr 19:** Beta closes, final fixes

### Beta Criteria
- Farms with 5-30 horses
- Active barn management needs (not just pasture pets)
- Willing to provide weekly feedback
- Mix of: boarding barns, lesson barns, private farms

### Beta Offer
- Free access through July 31, 2026 (90 days post-launch)
- Direct line to founders for support
- Input on feature roadmap
- "Founding Farm" badge on profile

### Feedback Collection
- Weekly survey (5 questions, 2-minute completion)
- Bug report form (in-app or email)
- Optional 15-minute video call each week
- Tracked in shared spreadsheet or Notion board

### Success Metrics for Beta
- [ ] 80%+ of beta barns add at least 5 horses
- [ ] 60%+ create at least 1 invoice
- [ ] 50%+ use daily care features weekly
- [ ] NPS score of 40+
- [ ] No critical/blocking bugs by end of beta
- [ ] Average page load time under 2 seconds

---

## 9. Launch Week Plan

### April 27 (Mon) — Final Prep
- [ ] Final production deployment
- [ ] All environment variables verified
- [ ] Run full manual QA checklist
- [ ] Verify Stripe is in live mode
- [ ] Verify email delivery works
- [ ] Pre-schedule all social media posts
- [ ] Prepare customer support templates

### April 28 (Tue) — Soft Launch
- [ ] Enable public sign-up
- [ ] Invite beta testers to convert to paid (with discount code)
- [ ] Monitor error rates, sign-up funnel, performance
- [ ] Address any issues found

### April 29 (Wed) — Buffer Day
- [ ] Fix any issues from soft launch
- [ ] Final marketing asset review
- [ ] Test launch announcements (drafts ready)

### April 30 (Thu) — Eve of Launch
- [ ] Schedule Product Hunt post for midnight
- [ ] Queue email blast for 9 AM ET
- [ ] Final production health check
- [ ] Team briefing: launch day responsibilities

### May 1 (Thu) — LAUNCH DAY
- **12:01 AM PT:** Product Hunt goes live
- **6:00 AM ET:** Social media posts go live
- **9:00 AM ET:** Email blast to waitlist
- **All day:** Monitor metrics, respond to comments, fix urgent issues
- **EOD:** Team debrief, review Day 1 numbers

### May 2-4 (Fri-Sun) — Post-Launch Support
- [ ] Respond to all Product Hunt comments
- [ ] Monitor sign-up funnel and conversion rates
- [ ] Fix any reported bugs (hotfix deploy if needed)
- [ ] Follow up with Day 1 sign-ups (welcome email + onboarding help)
- [ ] Post launch update on social media

---

## 10. Post-Launch Plan

### Week 1-2 (May 1-14): Stabilization
- Monitor error rates and performance daily
- Respond to all support requests within 4 hours
- Deploy hotfixes for critical bugs
- Publish 2-3 help articles based on common questions
- Track key metrics daily

### Month 1 (May): Growth
- Analyze sign-up funnel drop-off points
- A/B test landing page headlines
- Start content marketing (blog posts about barn management)
- Reach out to equestrian influencers
- Gather and publish testimonials

### Month 2-3 (Jun-Jul): Feature Iteration
- Prioritize feature requests from paying customers
- Ship mobile app to App Store / Play Store (Capacitor already set up)
- Add email notification system (event reminders, invoice due dates)
- Implement QuickBooks integration (endpoint stub exists)
- Explore SMS alerts for urgent health notifications

### Key Metrics to Track

| Metric | Target (Month 1) | Target (Month 3) |
|--------|-------------------|-------------------|
| Sign-ups | 200 | 600 |
| Paid conversions | 50 (25% of sign-ups) | 180 (30%) |
| MRR | $1,250 | $4,500+ |
| Churn rate | < 5% | < 5% |
| NPS | 40+ | 50+ |
| Avg. horses per barn | 8+ | 10+ |
| Support tickets/day | < 10 | < 15 |
| Uptime | 99.9% | 99.9% |

### Analytics Setup
- [ ] Plausible or PostHog (privacy-friendly analytics)
- [ ] Stripe Dashboard for revenue metrics
- [ ] Sentry for error tracking
- [ ] Custom dashboard for barn/horse/user counts (admin-only page)

---

## 11. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Stripe verification delays** | Medium | Critical | Start verification by Mar 1; have backup (manual invoicing) |
| **Database scaling issues** | Low | High | Supabase handles scaling; set up connection pooling early |
| **Clerk auth outage** | Low | Critical | Demo mode fallback exists; communicate status to users |
| **Low sign-up rate** | Medium | High | A/B test landing page; increase ad spend; personal outreach |
| **Data loss** | Very Low | Critical | Automated daily backups with 30-day retention; test restore |
| **Security breach** | Low | Critical | Security audit pre-launch; rate limiting; input validation |
| **Competitor launches** | Medium | Medium | Focus on "affordable for small farms" differentiator |
| **Beta feedback reveals major UX issues** | Medium | Medium | 3-week beta window allows time for iteration |
| **Railway platform issues** | Low | High | Document migration path to Vercel as backup |
| **Email deliverability** | Medium | Medium | Set up SPF/DKIM/DMARC early; use reputable provider |

---

## 12. Budget Estimates

### Monthly Recurring Costs (at launch)

| Service | Free Tier | Paid Estimate | Notes |
|---------|-----------|---------------|-------|
| Railway | 500 hrs free | ~$20/mo | Auto-scaling, usage-based |
| Supabase (DB + Storage) | 500MB free | ~$25/mo | Pro plan at scale |
| Clerk (Auth) | 10K MAU free | $0-25/mo | Free tier likely sufficient at launch |
| Stripe | N/A | 2.9% + $0.30/txn | Deducted from revenue |
| Sentry | 5K events free | $0 | Free tier sufficient |
| Resend (Email) | 3K/mo free | $0-20/mo | Free tier initially |
| Domain + DNS | N/A | ~$15/yr | Cloudflare or Namecheap |
| Uptime monitoring | Free tier | $0 | UptimeRobot free |
| **Total infrastructure** | | **~$50-70/mo** | |

### One-Time Costs

| Item | Estimate | Notes |
|------|----------|-------|
| Domain registration | $15 | .app or .com |
| Stripe setup | $0 | No setup fee |
| SSL certificate | $0 | Free via Cloudflare/Railway |
| **Total one-time** | **$15** | |

### Marketing Budget (Month 1)

| Channel | Budget |
|---------|--------|
| Google Ads | $500 |
| Social media (boosted posts) | $200 |
| Printed materials (flyers) | $100 |
| **Total marketing** | **$800** |

### Break-Even Analysis
- Monthly costs: ~$850 (infra + marketing)
- Revenue per barn: $25-45/mo
- **Break-even: 25-35 paying barns**
- Target: 50 barns by end of Month 1 = ~$1,250+ MRR

---

## 13. Key Milestones & Timeline

```
Feb 10  ┬─── Phase 1: Polish & Hardening ─────────────────┐
        │    Week 1-2: UI/UX Polish                        │
        │    Week 3: Accessibility audit                   │
        │    Week 4: Test coverage                         │
Mar 7   ┴──────────────────────────────────────────────────┘

Mar 8   ┬─── Phase 2: Infrastructure ─────────────────────┐
        │    Week 5: Production database                   │
        │    Week 6: Stripe + Clerk + domain               │
        │    Week 7: Monitoring + email                    │
Mar 28  ┴──────────────────────────────────────────────────┘

Mar 15  ── Open beta applications ──

Mar 29  ┬─── Phase 3: Beta Testing ───────────────────────┐
        │    Week 8: Internal beta                         │
        │    Week 9-10: Closed beta (5-10 barns)           │
Apr 18  ┴──────────────────────────────────────────────────┘

Apr 19  ┬─── Phase 4: Launch Prep ────────────────────────┐
        │    Week 11: Bug fixes + performance              │
        │    Week 12: Marketing + final checks             │
Apr 30  ┴──────────────────────────────────────────────────┘

MAY 1   ══════ LAUNCH DAY ══════

May 1-14 ── Stabilization & support ──
Jun-Jul  ── Feature iteration & mobile app ──
```

### Critical Path Items (Blockers)
These items must be completed on time or the launch date is at risk:

1. **Mar 1:** Start Stripe business verification (can take 2-4 weeks)
2. **Mar 8:** Production database provisioned and tested
3. **Mar 15:** Beta application page live
4. **Mar 28:** All infrastructure operational
5. **Apr 18:** All critical beta bugs resolved
6. **Apr 27:** Final deployment verified and healthy

---

## Appendix A: Production Environment Variable Template

See `.env.example` in repository root for full template.

## Appendix B: Emergency Contacts

| Role | Responsibility | Contact |
|------|---------------|---------|
| Lead Developer | Code fixes, deployments | TBD |
| Infrastructure | Railway, Supabase, DNS | TBD |
| Billing | Stripe issues, refunds | TBD |
| Support | Customer-facing responses | TBD |

## Appendix C: Launch Day Checklist (Print This)

```
□ Production deployment is healthy (/api/health returns 200)
□ Stripe is in live mode
□ Demo mode is disabled
□ All monitoring alerts are active
□ Email delivery is working
□ Product Hunt post is live
□ Social media posts are scheduled
□ Email blast is sent
□ Support inbox is monitored
□ Error dashboard is open and watched
□ Team is available in Slack/Discord
```

---

*This is a living document. Update as plans evolve.*
