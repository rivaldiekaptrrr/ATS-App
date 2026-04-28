import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function createClient() {
    const cookieStore = await cookies();

    // Use dummy values in mock mode to prevent crash
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
    const supabaseUrl = useMockData ? 'https://dummy.supabase.co' : process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = useMockData ? 'dummy-key' : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    return createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}

export async function createServiceClient() {
    // Service Role client should NOT interact with cookies or user session.
    // It is a pure admin client.
    // Use dummy values in mock mode to prevent crash
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
    const supabaseUrl = useMockData ? 'https://dummy.supabase.co' : process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = useMockData ? 'dummy-key' : process.env.SUPABASE_SERVICE_ROLE_KEY!;

    return createSupabaseClient(
        supabaseUrl,
        supabaseKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false
            }
        }
    );
}

