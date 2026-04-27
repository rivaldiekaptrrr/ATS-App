'use server';

import { createClient } from '@/lib/supabase/server'; // Correct import for Server Action
import { createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signUpUser(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const companyName = formData.get('companyName') as string;
    const name = formData.get('name') as string;

    const supabase = await createClient(); // Await is required for server client
    const serviceClient = await createServiceClient();

    // 1. Sign Up Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: name },
        }
    });

    if (authError) {
        console.error("Auth Error:", authError);
        return { error: `Auth Error: ${authError.message}` };
    }

    if (!authData.user) {
        return { error: 'Gagal membuat akun. Mohon cek email Anda jika verifikasi aktif.' };
    }

    // If user is created but identites is empty, it might mean user already exists
    if (authData.user.identities && authData.user.identities.length === 0) {
        return { error: 'Email ini sudah terdaftar. Silakan login.' };
    }

    const userId = authData.user.id;
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);

    // 2. Create Company
    // Use serviceClient to bypass RLS policies during registration
    const { data: company, error: companyError } = await serviceClient
        .from('companies')
        .insert({
            name: companyName,
            slug: slug,
            primary_color: '#3B82F6',
            parsing_config: { engine: 'library' } // Set default config
        })
        .select('id')
        .single();

    if (companyError || !company) {
        console.error('Company creation failed:', companyError);
        return { error: `Gagal membuat DB Perusahaan: ${companyError?.message}` };
    }

    // 3. Create HR User linked to Company
    const { error: hrError } = await serviceClient
        .from('hr_users')
        .insert({
            id: userId,
            company_id: company.id,
            full_name: name,
            email: email,
            role: 'admin'
        });

    if (hrError) {
        console.error('HR profile creation failed:', hrError);
        // Try to rollback company? No, keep it simple for now.
        return { error: `Gagal membuat profil HR: ${hrError.message}` };
    }

    return { success: true };
}

export async function signOutUser() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
}
