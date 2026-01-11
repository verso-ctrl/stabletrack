#!/usr/bin/env node

/**
 * Database setup script for StableTrack
 * 
 * Usage:
 *   npx tsx scripts/setup-db.ts          # Auto-detect based on .env
 *   npx tsx scripts/setup-db.ts sqlite   # Force SQLite (local demo)
 *   npx tsx scripts/setup-db.ts postgres # Force PostgreSQL (Supabase)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PRISMA_DIR = path.join(process.cwd(), 'prisma');
const SCHEMA_FILE = path.join(PRISMA_DIR, 'schema.prisma');
const SQLITE_SCHEMA = path.join(PRISMA_DIR, 'schema.sqlite.prisma');
const POSTGRES_SCHEMA = path.join(PRISMA_DIR, 'schema.postgres.prisma');

function run(cmd: string) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

function detectMode(): 'sqlite' | 'postgres' {
  // Check if DATABASE_URL is set in environment or .env
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL.startsWith('postgresql') ? 'postgres' : 'sqlite';
  }

  // Check .env file
  const envFile = path.join(process.cwd(), '.env');
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf-8');
    if (content.includes('DATABASE_URL') && content.includes('postgresql')) {
      return 'postgres';
    }
  }

  return 'sqlite';
}

function setupSchema(mode: 'sqlite' | 'postgres') {
  console.log(`\n🔧 Setting up ${mode === 'postgres' ? 'PostgreSQL (Supabase)' : 'SQLite (local demo)'} database...\n`);

  const sourceSchema = mode === 'postgres' ? POSTGRES_SCHEMA : SQLITE_SCHEMA;
  
  // Check if source schema exists
  if (!fs.existsSync(sourceSchema)) {
    // If source doesn't exist, use current schema (assume it's configured correctly)
    console.log(`Using existing schema.prisma for ${mode}`);
  } else {
    // Copy the appropriate schema
    fs.copyFileSync(sourceSchema, SCHEMA_FILE);
    console.log(`✅ Copied ${mode} schema`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  let mode: 'sqlite' | 'postgres';

  if (args[0] === 'sqlite') {
    mode = 'sqlite';
  } else if (args[0] === 'postgres' || args[0] === 'postgresql' || args[0] === 'supabase') {
    mode = 'postgres';
  } else {
    mode = detectMode();
    console.log(`\n🔍 Auto-detected database mode: ${mode}`);
  }

  // Setup the schema
  setupSchema(mode);

  // Generate Prisma client
  console.log('\n📦 Generating Prisma client...');
  run('npx prisma generate');

  // Push schema to database
  console.log('\n🚀 Pushing schema to database...');
  if (mode === 'sqlite') {
    // For SQLite, remove old db file first
    const dbFile = path.join(PRISMA_DIR, 'dev.db');
    if (fs.existsSync(dbFile)) {
      fs.unlinkSync(dbFile);
      console.log('   Removed old dev.db');
    }
  }
  run('npx prisma db push');

  // Ask about seeding
  console.log('\n🌱 Seeding database with demo data...');
  run('npx tsx prisma/seed.ts');

  console.log('\n✅ Database setup complete!');
  console.log(`\n📊 Mode: ${mode === 'postgres' ? 'PostgreSQL (Supabase)' : 'SQLite (local demo)'}`);
  console.log('\n🚀 Run `npm run dev` to start the app\n');
}

main().catch(console.error);
