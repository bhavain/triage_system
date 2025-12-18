import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class SupabaseConfig {
  private static instance: SupabaseClient;

  static getInstance(): SupabaseClient {
    if (!SupabaseConfig.instance) {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error(
          'Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_KEY environment variables.',
        );
      }

      SupabaseConfig.instance = createClient(supabaseUrl, supabaseKey);
    }

    return SupabaseConfig.instance;
  }
}

export const supabase = SupabaseConfig.getInstance;
