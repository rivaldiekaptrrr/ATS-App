import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
    const supabaseUrl = useMockData ? 'https://dummy.supabase.co' : process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = useMockData ? 'dummy-key' : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    return createBrowserClient(
        supabaseUrl,
        supabaseKey
    );
}
