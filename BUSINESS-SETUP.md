# BarnKeep — Business Setup & Tax Guide

**Created:** February 8, 2026
**Disclaimer:** This is general guidance, not legal or tax advice. Consult a CPA and business attorney before making decisions. Laws vary by state.

---

## Table of Contents

1. [Should You Form an LLC?](#1-should-you-form-an-llc)
2. [Business Entity Options](#2-business-entity-options)
3. [Step-by-Step Business Formation](#3-step-by-step-business-formation)
4. [Tax Setup & Obligations](#4-tax-setup--obligations)
5. [SaaS-Specific Tax Considerations](#5-saas-specific-tax-considerations)
6. [Stripe & Payment Tax Handling](#6-stripe--payment-tax-handling)
7. [Bookkeeping & Accounting](#7-bookkeeping--accounting)
8. [Insurance](#8-insurance)
9. [Legal Documents You Need](#9-legal-documents-you-need)
10. [Estimated Costs Summary](#10-estimated-costs-summary)
11. [Action Checklist](#11-action-checklist)

---

## 1. Should You Form an LLC?

**Short answer: Yes.** For a SaaS that handles customer payments and stores data, an LLC is strongly recommended.

### Why an LLC Matters for BarnKeep

| Without LLC (Sole Proprietorship) | With LLC |
|-----------------------------------|----------|
| You and the business are the same legal entity | Business is a separate legal entity |
| A lawsuit against BarnKeep = a lawsuit against you personally | Your personal assets (home, car, savings) are shielded |
| A data breach claim could target your personal assets | Liability is limited to business assets |
| Looks less professional to partners and customers | Customers and Stripe take you more seriously |
| Mixing personal and business finances is easy (and risky) | Forces clean separation of finances |

### When You Could Skip It
- You're just testing the idea with zero paying customers
- You have no personal assets to protect
- Even then, forming an LLC is cheap and fast in most states

**Bottom line:** Before you take your first dollar from a customer on May 1, you should have an LLC in place.

---

## 2. Business Entity Options

### Option A: Single-Member LLC (Recommended)

**Best for:** Solo founders, early-stage SaaS

- Simple to form ($50-500 depending on state)
- Liability protection for personal assets
- "Pass-through" taxation — profits/losses go on your personal tax return
- No corporate formalities (no board meetings, no minutes)
- Can elect S-Corp taxation later if revenue grows

**Tax treatment:** By default, the IRS treats a single-member LLC as a "disregarded entity." You report business income on **Schedule C** of your personal 1040. You pay self-employment tax (15.3%) on net profits.

### Option B: Multi-Member LLC

**Best for:** If you have a co-founder

- Same liability protection
- Requires an Operating Agreement defining ownership splits
- Each member reports their share on personal taxes (Schedule K-1)
- Slightly more complex tax filing

### Option C: LLC with S-Corp Election

**Best for:** When net profits exceed ~$40,000-50,000/year

- You form an LLC, then file IRS Form 2553 to elect S-Corp status
- You pay yourself a "reasonable salary" (subject to payroll tax)
- Remaining profits are distributions (not subject to self-employment tax)
- **Example:** $80K profit → $45K salary (taxed normally) + $35K distribution (no SE tax) = save ~$5,000/year in self-employment taxes
- Adds complexity: payroll, W-2s, quarterly payroll tax filings
- **Don't do this until you're profitable.** Revisit when MRR hits $4,000+

### Option D: C-Corporation

**Best for:** If you plan to raise venture capital

- Required by most VC investors
- Double taxation (corporate tax + personal tax on dividends)
- Complex and expensive to maintain
- Not recommended unless seeking institutional investment

### Recommendation

**Start with a Single-Member LLC.** It's the simplest structure that gives you liability protection. You can always elect S-Corp later or convert to a C-Corp if you raise funding.

---

## 3. Step-by-Step Business Formation

### Step 1: Choose Your State

**Option A — Your home state (simplest)**
- File in the state where you live and operate
- Avoids paying fees in multiple states
- Most straightforward for tax filing

**Option B — Wyoming or Delaware (popular for tech)**
- Wyoming: No state income tax, strong privacy, $100/year, asset protection
- Delaware: Preferred for C-Corps seeking VC; less relevant for LLCs
- Downside: If you live elsewhere, you still need to register as a "foreign LLC" in your home state (extra fees)

**Recommendation:** File in your home state unless you have a specific reason not to.

### Step 2: Choose a Business Name

- Verify availability on your state's Secretary of State website
- Check USPTO trademark database (https://tess2.uspto.gov) for conflicts
- Secure the domain name (barnkeep.com, getbarnkeep.com, etc.)
- Consider trademarking "BarnKeep" later ($250-350 per class via USPTO)

### Step 3: File Articles of Organization

- File with your state's Secretary of State
- Typical cost: $50-500 (varies by state)
- Processing time: 1-10 business days (expedited available in most states)
- You can file online in most states
- **Services that handle this for you:** Northwest Registered Agent ($39 + state fee), ZenBusiness ($0 + state fee), or directly with your state

### Step 4: Get an EIN (Employer Identification Number)

- Free from the IRS: https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online
- Takes 5 minutes online, you get the number immediately
- Required for: business bank account, Stripe, hiring, tax filing
- This is your business's "social security number"

### Step 5: Open a Business Bank Account

- Bring: EIN letter, Articles of Organization, government ID
- **Keep business and personal finances completely separate**
- Good options for small SaaS: Mercury, Relay, Bluevine (online banks with no fees), or a local credit union
- Get a business debit card for business expenses
- Connect this account to Stripe for payouts

### Step 6: Register for State/Local Requirements

- **Business license:** Check your city/county requirements
- **Sales tax permit:** If your state taxes SaaS (see Section 5)
- **State tax registration:** Some states require separate registration for income tax withholding

### Step 7: Create an Operating Agreement

Even as a single-member LLC, write an Operating Agreement. It:
- Proves the LLC is a real, separate entity (strengthens liability protection)
- Documents ownership and management structure
- Defines what happens if you add partners later
- Free templates available online; a lawyer can review for $200-300

---

## 4. Tax Setup & Obligations

### Federal Taxes

| Tax | What | When | How |
|-----|------|------|-----|
| **Income Tax** | Net profit from BarnKeep | April 15 (annual) | Schedule C on Form 1040 |
| **Self-Employment Tax** | Social Security + Medicare (15.3% of net profit) | April 15 (annual) | Schedule SE on Form 1040 |
| **Quarterly Estimated Taxes** | Prepay income + SE tax if you expect to owe $1,000+ | Apr 15, Jun 15, Sep 15, Jan 15 | Form 1040-ES (pay via IRS Direct Pay) |

### How Quarterly Estimated Taxes Work

Once BarnKeep is generating revenue, you'll likely need to pay estimated taxes quarterly to avoid IRS penalties.

**Example at $2,000 MRR ($24,000/year):**
```
Gross revenue:                    $24,000
Deductible expenses:             -$10,000  (infra, marketing, tools)
Net profit:                       $14,000

Federal income tax (~12%):         $1,680
Self-employment tax (15.3%):       $2,142
Total federal tax:                 $3,822

Quarterly payment:                   $956  (pay this each quarter)
```

**Safe harbor rule:** If you pay at least 100% of last year's tax liability (or 110% if income > $150K), you won't owe penalties even if you underpay.

### State Taxes

- Depends entirely on your state
- Some states have no income tax (TX, FL, WY, WA, NV, SD, TN, AK, NH)
- Some states have separate business taxes or franchise taxes
- **Action:** Check your state's Department of Revenue website

---

## 5. SaaS-Specific Tax Considerations

### The SaaS Sales Tax Problem

SaaS sales tax is complicated because **states disagree on whether software-as-a-service is taxable.** This is the single most confusing tax issue for SaaS founders.

### Current State of SaaS Taxation (2026)

| Category | States | Examples |
|----------|--------|---------|
| **SaaS IS taxable** | ~25 states | TX, NY, PA, OH, WA, CT, DC, HI, NM, SD, RI, TN, UT |
| **SaaS is NOT taxable** | ~20 states | CA, FL, CO, IL, MO, VA, GA, MI, NV, OR (no sales tax) |
| **It's complicated** | ~5 states | Depends on how the software is delivered/used |

### What This Means for BarnKeep

**If you sell to customers in states that tax SaaS, you may need to collect and remit sales tax.** This obligation is triggered by "nexus" — a connection to that state.

**Economic nexus** (post-Wayfair): Most states require you to collect sales tax if you exceed a threshold in that state (typically $100K in sales OR 200 transactions per year).

### Practical Approach for Launch

1. **At launch (< 50 customers):** You almost certainly don't have nexus in most states. Focus on:
   - Your home state — register for sales tax if your state taxes SaaS
   - Any state where you have a physical presence (office, employees)

2. **As you grow (50-200 customers):** Monitor state-by-state revenue thresholds. When you approach $100K or 200 transactions in any single state, register there.

3. **At scale:** Use an automated sales tax service:
   - **Stripe Tax** — Built into Stripe, calculates and collects automatically ($0.50/transaction)
   - **TaxJar** — Automated filing and remittance
   - **Avalara** — Enterprise-grade solution

### Action Items for Launch
- [ ] Determine if your home state taxes SaaS
- [ ] If yes, register for a sales tax permit in your home state
- [ ] Enable Stripe Tax for automatic calculation (can be toggled on later)
- [ ] Track revenue by state in your accounting software
- [ ] Revisit multi-state obligations quarterly

---

## 6. Stripe & Payment Tax Handling

### Stripe Setup for Tax Compliance

**Stripe will send you a 1099-K** if you process over $600 in a calendar year (federal threshold as of 2024+). This reports your gross payment volume to the IRS.

### What Stripe Handles
- Payment processing and payouts to your bank
- 1099-K reporting to IRS
- **Stripe Tax** (optional): Calculates, collects, and reports sales tax
- **Stripe Billing**: Manages subscriptions, invoicing
- PCI compliance for card data

### What Stripe Does NOT Handle
- Filing your income taxes
- Remitting collected sales tax to states (Stripe Tax can file in some states)
- Tracking deductible expenses
- Quarterly estimated tax payments

### Stripe Tax Configuration

```
Stripe Dashboard → Settings → Tax

1. Add your business address (determines "origin" for tax)
2. Set product tax code: "SaaS - business use" (txcd_10103001)
3. Enable automatic tax collection on subscriptions
4. Register tax IDs for states where you have nexus
5. Stripe calculates and adds tax to invoices automatically
```

**Cost:** $0.50 per transaction where tax is calculated. Worth it once you have multi-state obligations.

### Important: Gross vs. Net Revenue

Your 1099-K will show **gross** payment volume (before Stripe fees). Your actual revenue is:
```
Gross payments (1099-K)          $30,000
- Stripe fees (2.9% + $0.30)    -$1,050
- Refunds                          -$200
= Net revenue                   $28,750  ← this is what you report as income
```

Keep records of Stripe fees and refunds — they're deductible expenses.

---

## 7. Bookkeeping & Accounting

### Deductible Business Expenses for BarnKeep

| Category | Examples | Est. Annual |
|----------|----------|-------------|
| **Hosting & Infrastructure** | Railway, Supabase, Cloudflare | $600-850 |
| **SaaS Tools** | Clerk, Sentry, email service, analytics | $0-300 |
| **Payment Processing** | Stripe fees (2.9% + $0.30/txn) | Varies |
| **Domain & DNS** | barnkeep.com registration | $15 |
| **Marketing** | Google Ads, social media ads, flyers | $9,600 |
| **Software** | IDE, design tools, development tools | $0-500 |
| **Professional Services** | CPA, lawyer, trademark filing | $500-2,000 |
| **Insurance** | Business liability, E&O | $500-1,200 |
| **Home Office** | Portion of rent/utilities (if WFH) | Varies |
| **Education** | Courses, conferences related to business | Varies |
| **Internet** | Business portion of internet bill | Varies |

### Home Office Deduction

If you work from home, you can deduct a portion of housing costs:
- **Simplified method:** $5/sq ft, up to 300 sq ft = max $1,500 deduction
- **Regular method:** Calculate actual percentage of home used for business (more paperwork, potentially larger deduction)

### Accounting Software

| Tool | Price | Best For |
|------|-------|----------|
| **Wave** | Free | Simple bookkeeping, invoicing |
| **Hurdlr** | $10/mo | Freelancers/solo founders, auto expense tracking |
| **QuickBooks Self-Employed** | $15/mo | Quarterly tax estimates, mileage tracking |
| **QuickBooks Online** | $30/mo | Growth stage, S-Corp, need accountant access |
| **Xero** | $15/mo | Clean interface, good Stripe integration |

**Recommendation:** Start with **Wave** (free) or **Hurdlr** ($10/mo). Move to QuickBooks Online when you have an accountant or elect S-Corp.

### Monthly Bookkeeping Routine

1. **Weekly (10 min):** Categorize transactions in accounting software
2. **Monthly (30 min):**
   - Reconcile bank account with accounting software
   - Review Stripe payouts vs. recorded revenue
   - Save receipts for any business purchases
   - Note any new state where you gained customers
3. **Quarterly (1 hour):**
   - Calculate and pay estimated taxes (Form 1040-ES)
   - Review P&L statement
   - Check sales tax obligations by state
4. **Annually (hire a CPA):**
   - File federal + state income taxes
   - File sales tax returns for registered states
   - Review business structure (time for S-Corp election?)
   - Renew LLC annual report/franchise tax

---

## 8. Insurance

### Recommended Policies

| Policy | What It Covers | Est. Cost | Priority |
|--------|---------------|-----------|----------|
| **General Liability** | Third-party bodily injury, property damage claims | $400-600/yr | High |
| **Professional Liability (E&O)** | Claims that your software caused financial harm (e.g., missed vet reminder led to horse injury) | $500-1,000/yr | High |
| **Cyber Liability** | Data breaches, ransomware, notification costs | $500-1,500/yr | Medium |
| **Business Owner's Policy (BOP)** | Bundles general liability + property | $500-800/yr | High |

### Why E&O Insurance Matters for BarnKeep

BarnKeep manages health records, medication schedules, and vet reminders. If a customer claims they missed a critical medication dose because your app had a bug, E&O insurance covers your legal defense and any settlements.

### Where to Get Coverage
- **Hiscox** — Popular for tech/SaaS businesses, online quotes
- **Next Insurance** — Fast online quotes, good for small businesses
- **Hartford** — BOP bundles, established carrier
- **Embroker** — Tech-focused, startup-friendly

**Action:** Get quotes before launch. A BOP + E&O bundle typically runs $1,000-1,500/year.

---

## 9. Legal Documents You Need

### Required Before Launch

| Document | Purpose | How to Get |
|----------|---------|------------|
| **Terms of Service** | Defines user rights, liability limits, dispute resolution | Already exists at `/terms` — have a lawyer review ($300-500) |
| **Privacy Policy** | Discloses data collection, storage, sharing practices | Already exists at `/privacy` — have a lawyer review ($300-500) |
| **Operating Agreement** | Governs LLC structure and management | Template + lawyer review ($200-300) |

### Recommended

| Document | Purpose | How to Get |
|----------|---------|------------|
| **Cookie Policy** | Required in some jurisdictions, good practice | Template or lawyer ($100-200) |
| **Acceptable Use Policy** | Defines prohibited uses of your platform | Write yourself or lawyer ($200) |
| **Data Processing Agreement (DPA)** | Required if handling EU customer data (GDPR) | Template available from Clerk/Stripe |
| **SLA (Service Level Agreement)** | Uptime guarantees, support response times | Write yourself |
| **Refund Policy** | Clear terms on cancellation and refunds | Include in Terms of Service |

### Terms of Service — Key Clauses for SaaS

Make sure your ToS includes:
- [ ] Limitation of liability (cap damages at amount paid in last 12 months)
- [ ] Disclaimer of warranties ("as is" / "as available")
- [ ] Indemnification (users indemnify you for their misuse)
- [ ] Governing law and jurisdiction (your state)
- [ ] Data ownership (customers own their data, you have license to host it)
- [ ] Termination rights (you can terminate for violation)
- [ ] Auto-renewal and cancellation terms (Stripe handles mechanics)
- [ ] Dispute resolution (arbitration clause can save you from lawsuits)

---

## 10. Estimated Costs Summary

### One-Time Setup Costs

| Item | Low | High |
|------|-----|------|
| LLC filing (state fee) | $50 | $500 |
| Registered agent (if needed) | $0 | $125/yr |
| EIN | $0 | $0 |
| Business bank account | $0 | $0 |
| Operating Agreement (lawyer review) | $0 | $300 |
| Terms of Service review | $0 | $500 |
| Privacy Policy review | $0 | $500 |
| Domain name | $12 | $15 |
| **Total one-time** | **$62** | **$1,940** |

### Year 1 Recurring Costs

| Item | Monthly | Annual |
|------|---------|--------|
| Infrastructure (Railway, Supabase, etc.) | $50-70 | $600-840 |
| LLC annual report / franchise tax | — | $0-800 |
| Accounting software | $0-15 | $0-180 |
| Insurance (BOP + E&O) | $80-125 | $1,000-1,500 |
| CPA (annual tax filing) | — | $500-1,500 |
| Marketing | $800 | $9,600 |
| Stripe fees (on $30K revenue) | ~$90 | ~$1,080 |
| **Total Year 1** | | **$12,780-$15,500** |

### Revenue Needed to Cover Costs

At $25/mo per barn:
- **Break-even on infrastructure:** 3 barns
- **Break-even on all costs (excl. marketing):** 10-15 barns
- **Break-even on everything:** 40-50 barns
- **Target Year 1 (180 barns by Dec):** $54,000 ARR

---

## 11. Action Checklist

### Immediate (February 2026)
- [ ] **Decide on LLC state** — file in your home state unless you have a reason not to
- [ ] **File Articles of Organization** with Secretary of State
- [ ] **Apply for EIN** on IRS.gov (free, instant)
- [ ] **Open business bank account** (Mercury, Relay, or local bank)
- [ ] **Start using accounting software** (Wave or Hurdlr)

### Before Beta (March 2026)
- [ ] **Write Operating Agreement** (even single-member — use a template)
- [ ] **Check home state SaaS sales tax** — register for permit if required
- [ ] **Get insurance quotes** (Hiscox, Next Insurance)
- [ ] **Set up Stripe with business bank account** (not personal)
- [ ] **Have a lawyer review Terms of Service and Privacy Policy** ($500-1,000)
- [ ] **Start tracking all business expenses** (receipts, subscriptions, tools)

### Before Launch (April 2026)
- [ ] **Bind insurance policies** (BOP + E&O minimum)
- [ ] **Configure Stripe Tax** for your home state at minimum
- [ ] **Set up quarterly estimated tax calendar** (next payment: Jun 15, 2026)
- [ ] **Verify LLC is in good standing** with Secretary of State

### After Launch (May 2026+)
- [ ] **Pay quarterly estimated taxes** (Jun 15, Sep 15, Jan 15, Apr 15)
- [ ] **Monthly bookkeeping** — categorize transactions, reconcile
- [ ] **Monitor state revenue thresholds** for sales tax nexus
- [ ] **Hire a CPA** before first tax season (find one familiar with SaaS/tech)
- [ ] **Consider S-Corp election** when net profit exceeds $40-50K/year
- [ ] **Trademark "BarnKeep"** once cash flow allows ($250-350 USPTO filing)

---

## Quick Decision Guide

```
Q: Should I form an LLC?
A: Yes. Do it before you take your first payment.

Q: Which state?
A: Your home state (simplest). Wyoming only if you want extra privacy.

Q: LLC or S-Corp?
A: LLC now. Elect S-Corp when profit exceeds $40-50K/year.

Q: Do I need to collect sales tax?
A: Check if your home state taxes SaaS. If yes, register and collect.
   Ignore other states until you hit $100K or 200 transactions there.

Q: Do I need a CPA?
A: Not immediately. Use accounting software now. Hire a CPA before
   your first tax filing (early 2027 for 2026 taxes).

Q: What's the minimum I need before May 1?
A: LLC + EIN + business bank account + insurance + Stripe on business account.
```

---

*This document is general guidance for informational purposes. Tax laws change frequently and vary by jurisdiction. Consult a licensed CPA and business attorney for advice specific to your situation.*
