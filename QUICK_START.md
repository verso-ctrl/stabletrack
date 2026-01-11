# Quick Start - Get Running in 5 Minutes

Follow these steps to get your StableTrack app running.

## Option 1: One-Click Install (Recommended)

Run this single command to install everything:

```bash
./install-all-dependencies.sh
```

This installs:
- ✅ Zod (validation)
- ✅ @hookform/resolvers (form validation)
- ✅ Sentry (error tracking)
- ✅ Jest (testing framework)
- ✅ Testing Library (React testing)

---

## Option 2: Manual Install

### Step 1: Install Production Dependencies

```bash
npm install zod @hookform/resolvers @sentry/nextjs
```

### Step 2: Install Test Dependencies (Optional)

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest
```

---

## After Installation

### 1. Database Migration (Required)

```bash
npx prisma db push
```

This creates the `assignedToId` field needed for event assignments.

### 2. Enable Tests (Optional)

```bash
mv __tests_disabled__/lib src/lib/__tests__
mv __tests_disabled__/components src/components/__tests__
```

### 3. Verify Everything Works

```bash
# Type check
npm run type-check

# Run tests
npm test

# Build production
npm run build
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Common Issues

### "jest: command not found"

**Cause:** Jest not installed yet

**Fix:**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom @types/jest
```

---

### "Cannot find module 'zod'"

**Cause:** Zod not installed yet

**Fix:**
```bash
npm install zod @hookform/resolvers
```

---

### TypeScript errors about test files

**Cause:** Test dependencies not installed

**Fix:** Either install test dependencies OR keep tests in `__tests_disabled__/`

---

### Database errors on event creation

**Cause:** Database migration not run

**Fix:**
```bash
npx prisma db push
```

---

## Full Checklist

- [ ] Install dependencies (`./install-all-dependencies.sh`)
- [ ] Run database migration (`npx prisma db push`)
- [ ] Enable tests (move from `__tests_disabled__/`)
- [ ] Run type check (`npm run type-check`)
- [ ] Run tests (`npm test`)
- [ ] Build production (`npm run build`)
- [ ] Start dev server (`npm run dev`)

---

## Production Deployment

See [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) for full production deployment guide.

Quick deploy to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## Need Help?

- **TypeScript errors?** See [TYPESCRIPT_ERRORS_FIXED.md](TYPESCRIPT_ERRORS_FIXED.md)
- **Testing?** See [TESTING_GUIDE.md](TESTING_GUIDE.md) or [MANUAL_TEST_CHECKLIST.md](MANUAL_TEST_CHECKLIST.md)
- **Sentry?** See [SENTRY_SETUP_COMPLETE.md](SENTRY_SETUP_COMPLETE.md)
- **Everything?** See [ALL_ISSUES_RESOLVED.md](ALL_ISSUES_RESOLVED.md)

---

**Estimated Time:** 5-10 minutes to be fully operational! 🚀
