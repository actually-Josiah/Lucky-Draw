// Admin/lib/supabaseClient.ts
// This client is for client-side interactions in the Admin Next.js app.
// It uses environment variables available in the browser.

import { createClient } from '@supabase/supabase-js';

// Ensure these environment variables are set in your .env.local for the Admin app
// and are exposed to the browser (NEXT_PUBLIC_ prefix).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are not set for the Admin app frontend.");
  // Provide a fallback or throw an error depending on desired behavior
  // For development, we might throw an error to make it obvious
  // For production, you might want to handle this more gracefully.
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Create a single Supabase client for the app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
