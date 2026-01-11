# StableTrack - Horse Farm Management System

A comprehensive horse farm management application with tier-based subscription system, file storage, and complete barn management features.

---

## 🚀 Quick Start (3 Commands!)

```bash
# 1. Install dependencies
npm install

# 2. Set up database and add demo data
npm run setup

# 3. Start the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

**That's it! No accounts, no API keys, no configuration needed.**

---

## ✨ Features

### Horse Management
- 🐴 Complete horse profiles with photos, documents, and health records
- 📸 Photo gallery with upload and primary photo selection
- 📄 Document storage (coggins, registrations, health certificates, etc.)
- 💊 Medication tracking with active/completed status
- 💉 Vaccination records with expiry tracking
- ⚖️ Weight and body condition score logging

### Daily Care
- 🍎 Feed program management with AM/PM schedules
- 💧 Water check logging
- 📝 Daily health checks
- ✅ Task management with assignments

### Scheduling
- 📅 Calendar with events (vet visits, farrier, vaccinations, etc.)
- 🔔 Alerts and reminders
- 🔄 Recurring events support

### Team Collaboration
- 👥 Team member management with roles (Owner, Manager, Caretaker)
- 📊 Activity logging
- 🔐 Permission-based access

### Billing & Clients
- 💰 Invoice generation
- 👤 Client portal access
- 📈 Financial reporting

### Subscription Tiers
- **Free**: 5 horses, 1 GB storage, basic features
- **Professional**: 25 horses, 10 GB storage, documents
- **Farm**: Unlimited horses, 25 GB storage, full features
- **Enterprise**: Multi-barn, 100 GB, API access

---

## 📁 What's Included

### Demo Data
- **Barn**: Willowbrook Farm (Lexington, KY)
- **5 Horses**: Thunder, Moonlight, Storm (on layup), Bella, Duke
- **Feed Programs**: Custom feed schedules for each horse
- **Vaccinations**: Current on RABIES, EWT, FLU_RHINO, WEST_NILE
- **Upcoming Events**: Farrier visits, vet appointments, dental, deworming
- **Tasks**: Daily feeding schedules and care tasks

### 32+ Pages
- Dashboard with stats and quick actions
- Horse list with search and filters
- Individual horse profiles with tabs
- Calendar with month/list views
- Task management
- Team member management
- Document storage
- Settings (profile, barn, billing, notifications)
- Help center

---

## 🛠 Technical Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 + Next.js 14 |
| Styling | Tailwind CSS |
| Database | SQLite (demo) / PostgreSQL (production) |
| ORM | Prisma |
| File Storage | Local (demo) / Supabase (production) |
| Auth | Demo mode / Clerk (production) |
| Payments | Demo mode / Stripe (production) |

---

## 📂 Project Structure

```
stabletrack-demo/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Demo data seeding
├── src/
│   ├── app/               # Next.js app router pages
│   │   ├── (dashboard)/   # Main app pages
│   │   ├── api/           # API routes
│   │   └── (marketing)/   # Marketing pages
│   ├── components/
│   │   ├── dashboard/     # Layout components
│   │   ├── horses/        # Horse-related components
│   │   ├── storage/       # File upload/gallery components
│   │   ├── subscription/  # Tier gating components
│   │   └── ui/            # Reusable UI components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and configs
│   │   ├── tiers.ts       # Subscription tier configuration
│   │   ├── storage.ts     # File storage utilities
│   │   └── auth.ts        # Authentication helpers
│   └── types/             # TypeScript definitions
└── uploads/               # Local file storage
```

---

## 🔧 Commands

```bash
npm run dev        # Start development server
npm run setup      # Reset and seed database
npm run build      # Build for production
npm run start      # Start production server
npm run db:studio  # Open Prisma Studio (database GUI)
```

### Reset Data

To reset to fresh demo data:
```bash
rm prisma/dev.db
npm run setup
```

---

## 🔒 Subscription Tier System

The app includes a comprehensive subscription tier system:

### Configuration
All tier configuration is in `src/lib/tiers.ts`:
- **TierLimits**: Horse count, team members, storage quotas
- **TierFeatures**: Feature flags per tier
- **TierPricing**: Monthly/annual pricing

### Components
- `FeatureGate`: Conditionally render based on tier
- `LimitGate`: Check numeric limits
- `UpgradeModal`: Subscription upgrade flow
- `StorageQuota`: Usage display component

### Hooks
- `useSubscription()`: Access tier info and limits
- `useTierPermissions()`: Permission checks
- `useStorageQuota()`: Storage usage tracking

---

## 🖼 Storage System

### Photo Gallery
- Drag-and-drop uploads
- Primary photo selection
- Per-horse photo limits by tier
- Automatic thumbnail generation

### Document Management
- Multiple document types (coggins, registrations, etc.)
- Expiry tracking
- Tier-based document type access

### API Routes
- `POST /api/storage/upload` - Upload files
- `DELETE /api/storage/delete` - Delete files
- `GET /api/storage/quota` - Get usage stats

---

## 🚀 Production Deployment

For production deployment with full features:

### 1. Database (Supabase)
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

### 2. Authentication (Clerk)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
```

### 3. Payments (Stripe)
```env
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
```

### 4. File Storage (Supabase)
```env
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

---

## 📄 License

MIT

---

Built with ❤️ for the equestrian community
