#!/bin/bash

echo "🚀 Installing All StableTrack Dependencies..."
echo ""
echo "This will install:"
echo "  ✓ Zod (validation)"
echo "  ✓ React Hook Form resolvers"
echo "  ✓ Sentry (error tracking)"
echo "  ✓ Jest & Testing Library (tests)"
echo ""

# Production dependencies
echo "📦 Installing production dependencies..."
npm install zod @hookform/resolvers @sentry/nextjs

echo ""
echo "🧪 Installing test dependencies..."
npm install --save-dev \
  jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest-environment-jsdom \
  @types/jest

echo ""
echo "✅ All dependencies installed!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Enable tests:"
echo "   mv __tests_disabled__/lib src/lib/__tests__"
echo "   mv __tests_disabled__/components src/components/__tests__"
echo ""
echo "2. Run database migration:"
echo "   npx prisma db push"
echo ""
echo "3. Run tests:"
echo "   npm test"
echo ""
echo "4. Start dev server:"
echo "   npm run dev"
echo ""
echo "✨ Ready to go!"
