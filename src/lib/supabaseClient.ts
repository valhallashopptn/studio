
'use client';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// This is a singleton pattern to ensure we only have one instance of the client.
let client: ReturnType<typeof createSupabaseClient> | undefined = undefined;

export function createClient() {
    if (client) {
        return client;
    }

    // These will be read from the `.env` file
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase URL and Anon Key must be defined in .env');
    }
    
    // Create and store the client instance.
    client = createSupabaseClient(supabaseUrl, supabaseAnonKey);
    return client;
}
