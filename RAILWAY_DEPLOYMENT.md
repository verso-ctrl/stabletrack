# Deploy StableTrack to Railway

This guide will walk you through deploying StableTrack to Railway.

## Prerequisites

1. **Railway Account** - Sign up at [railway.app](https://railway.app)
2. **GitHub Account** - For connecting your repository
3. **Clerk Account** - For authentication (optional, works in demo mode without it)
4. **Stripe Account** - For payments (optional)

---

## Step 1: Prepare Your Repository

### Option A: Deploy from GitHub (Recommended)

1. **Create a GitHub repository** (if you haven't already):
   ```bash
   cd "/Users/zackvega/Downloads/stabletrack-demo 2"
   git init
   git add .
   git commit -m "Initial commit - StableTrack app"
   ```

2. **Create a new repository on GitHub** and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/stabletrack.git
   git branch -M main
   git push -u origin main
   ```

### Option B: Deploy from CLI

Install Railway CLI:
```bash
npm i -g @railway/cli
railway login
```

---

## Step 2: Create Railway Project

### Via Railway Dashboard:

1. Go to [railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub repo"**
3. Select your StableTrack repository
4. Railway will auto-detect it's a Next.js app

### Via Railway CLI:

```bash
cd "/Users/zackvega/Downloads/stabletrack-demo 2"
railway init
railway up
```

---

## Step 3: Add PostgreSQL Database

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database" → "PostgreSQL"**
3. Railway will automatically create a database and add the `DATABASE_URL` environment variable

---

## Step 4: Configure Environment Variables

In Railway dashboard, go to your service → **Variables** tab and add:

### Required Variables

```bash
# Database (automatically added by Railway)
DATABASE_URL=postgresql://...  # Auto-populated by Railway

# Next.js
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app
```

### Optional Variables (for full features)

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase Storage (optional)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Step 5: Deploy!

Railway will automatically:
1. ✅ Install dependencies (`npm ci`)
2. ✅ Generate Prisma client (`npx prisma generate`)
3. ✅ Build Next.js app (`npm run build`)
4. ✅ Start production server (`npm run start`)

**Note:** The build might succeed but the start command may fail with the Next.js 14.2.x clientModules bug. See workarounds below.

---

## Step 6: Run Database Migrations

After deployment, run the database migration:

### Via Railway CLI:
```bash
railway run npx prisma db push
```

### Via Railway Dashboard:
1. Go to your service → **Settings** → **Deploy**
2. Add a one-time deploy command: `npx prisma db push`
3. Click **Deploy**

---

## Troubleshooting the clientModules Error

If you get the "Cannot read properties of undefined (reading 'clientModules')" error:

### Workaround 1: Use Development Mode (Quick Fix)

Update `railway.json`:
```json
{
  "deploy": {
    "startCommand": "npm run dev",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

Then redeploy. Development mode works fine and is actually used by many apps.

### Workaround 2: Upgrade to Next.js 15

```bash
npm install next@latest react@latest react-dom@latest
git add .
git commit -m "Upgrade to Next.js 15"
git push
```

Railway will automatically redeploy.

### Workaround 3: Use Vercel Instead

Vercel handles Next.js production builds better:
```bash
npm i -g vercel
vercel --prod
```

---

## Custom Domain

1. In Railway dashboard → **Settings** → **Domains**
2. Click **"Generate Domain"** for a free `.up.railway.app` domain
3. Or add your custom domain

---

## Monitoring & Logs

- **View Logs**: Railway Dashboard → Your Service → **Deployments** → Click latest deployment
- **Metrics**: Railway Dashboard → Your Service → **Metrics**
- **Database**: Railway Dashboard → PostgreSQL service → **Data** (view tables)

---

## Useful Railway Commands

```bash
# View logs
railway logs

# Open database
railway connect

# Run commands in Railway environment
railway run npx prisma studio

# Link local project to Railway
railway link

# Deploy
railway up
```

---

## Cost Estimate

- **Hobby Plan (Free Trial)**: $5 credit/month
  - Good for testing, runs out quickly

- **Developer Plan**: $5/month + usage
  - ~$5-10/month for small app with database

- **Pro Plan**: $20/month + usage
  - Better for production apps

---

## Post-Deployment Checklist

- [ ] Database migration completed (`npx prisma db push`)
- [ ] App accessible at Railway URL
- [ ] Can create account (if using Clerk)
- [ ] Can create barn
- [ ] Can add horses
- [ ] Check logs for errors
- [ ] Set up custom domain (optional)
- [ ] Configure Stripe webhooks (if using payments)

---

## Alternative: Deploy to Vercel (Recommended for Next.js)

If Railway's clientModules issue persists:

```bash
npm i -g vercel
vercel --prod
```

Vercel handles Next.js better since they created it. Plus:
- ✅ No clientModules bug
- ✅ Automatic previews for PRs
- ✅ Better Next.js optimization
- ✅ Free hobby tier

You'd still use Railway for PostgreSQL database.

---

## Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- StableTrack Issues: Check your logs in Railway dashboard

---

## Quick Deploy (Copy-Paste)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# Add database
# (Do this in Railway dashboard: + New → Database → PostgreSQL)

# Run migration
railway run npx prisma db push

# View logs
railway logs
```

Done! Your app should be live at `https://your-app.up.railway.app` 🚀
