// src/lib/supabase.ts
// Supabase client configuration for BarnKeep
// NOTE: In demo mode, Supabase is not used - local file storage is used instead

import { createClient } from '@supabase/supabase-js'

// Environment variables - these are optional in demo mode
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Check if Supabase is properly configured
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
)

// Client-side Supabase client (uses anon key, respects RLS)
// Will be null/non-functional if Supabase is not configured
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Server-side Supabase client (uses service role, bypasses RLS)
// Only use this in API routes, never expose to client
export const supabaseAdmin = (isSupabaseConfigured && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

// Storage bucket names
export const STORAGE_BUCKETS = {
  HORSE_PHOTOS: 'horse-photos',
  DOCUMENTS: 'documents',
  AVATARS: 'avatars',
  BARN_LOGOS: 'barn-logos',
} as const

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS]
