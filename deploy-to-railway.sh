#!/bin/bash

echo "🚂 Deploying StableTrack to Railway..."
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Railway CLI not found. Installing..."
    npm i -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging in to Railway..."
railway login

# Initialize project if not already linked
if [ ! -f "railway.toml" ]; then
    echo "🎬 Initializing Railway project..."
    railway init
fi

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Add PostgreSQL database in Railway dashboard (+ New → Database → PostgreSQL)"
echo "2. Add environment variables (see RAILWAY_DEPLOYMENT.md)"
echo "3. Run database migration: railway run npx prisma db push"
echo "4. View your app: railway open"
echo ""
echo "📚 Full guide: See RAILWAY_DEPLOYMENT.md"
