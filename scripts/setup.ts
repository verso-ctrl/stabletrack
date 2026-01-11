#!/usr/bin/env node

/**
 * StableTrack Setup Script
 * 
 * This script guides you through setting up Supabase and Stripe
 * Run with: npx tsx scripts/setup.ts
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

async function main() {
  console.log('\n🐴 StableTrack Setup\n');
  console.log('This script will help you configure Supabase and Stripe.\n');
  console.log('=' .repeat(60) + '\n');

  // Check if .env exists
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Created .env file from .env.example\n');
    } else {
      console.log('❌ No .env.example found. Please create .env manually.\n');
      process.exit(1);
    }
  }

  let envContent = fs.readFileSync(envPath, 'utf-8');

  // SUPABASE SETUP
  console.log('📦 SUPABASE SETUP\n');
  console.log('1. Go to https://supabase.com and create a new project');
  console.log('2. Go to Settings → Database → Connection string');
  console.log('3. Copy the URI connection string\n');

  const setupSupabase = await question('Do you want to configure Supabase now? (y/n): ');
  
  if (setupSupabase.toLowerCase() === 'y') {
    console.log('\nYour connection string looks like:');
    console.log('postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres\n');
    
    const projectRef = await question('Enter your project ref (the part after postgres.): ');
    const password = await question('Enter your database password: ');
    const region = await question('Enter your region (e.g., aws-0-us-east-1): ');

    const poolerUrl = `postgresql://postgres.${projectRef}:${password}@${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`;
    const directUrl = `postgresql://postgres.${projectRef}:${password}@${region}.pooler.supabase.com:5432/postgres`;

    envContent = envContent.replace(
      /DATABASE_URL="[^"]*"/,
      `DATABASE_URL="${poolerUrl}"`
    );
    envContent = envContent.replace(
      /DIRECT_URL="[^"]*"/,
      `DIRECT_URL="${directUrl}"`
    );

    console.log('\n✅ Supabase database URLs configured\n');
  }

  // STRIPE SETUP
  console.log('\n💳 STRIPE SETUP\n');
  console.log('1. Go to https://stripe.com and sign in');
  console.log('2. Make sure "Test mode" is ON (toggle in top right)');
  console.log('3. Go to Developers → API keys\n');

  const setupStripe = await question('Do you want to configure Stripe now? (y/n): ');

  if (setupStripe.toLowerCase() === 'y') {
    const secretKey = await question('Enter your Stripe Secret Key (sk_test_...): ');
    const publishableKey = await question('Enter your Stripe Publishable Key (pk_test_...): ');

    envContent = envContent.replace(
      /STRIPE_SECRET_KEY="[^"]*"/,
      `STRIPE_SECRET_KEY="${secretKey}"`
    );
    envContent = envContent.replace(
      /STRIPE_PUBLISHABLE_KEY="[^"]*"/,
      `STRIPE_PUBLISHABLE_KEY="${publishableKey}"`
    );

    console.log('\n✅ Stripe API keys configured');
    console.log('\n⚠️  For webhooks, run this command in a separate terminal:');
    console.log('   stripe listen --forward-to localhost:3000/api/webhooks/stripe');
    console.log('\n   Then copy the webhook signing secret (whsec_...) to your .env file\n');
  }

  // Save .env
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Saved .env file\n');

  // Next steps
  console.log('=' .repeat(60));
  console.log('\n🚀 NEXT STEPS:\n');
  console.log('1. Push the database schema to Supabase:');
  console.log('   npx prisma db push\n');
  console.log('2. Seed the database:');
  console.log('   npx tsx prisma/seed.ts\n');
  console.log('3. Start the development server:');
  console.log('   npm run dev\n');
  console.log('4. (Optional) Start Stripe webhook listener:');
  console.log('   stripe listen --forward-to localhost:3000/api/webhooks/stripe\n');

  rl.close();
}

main().catch(console.error);
