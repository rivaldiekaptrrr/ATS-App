'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface TeamMember {
    id: string;
    full_name: string;
    email: string;
    role: string;
    avatar_url: string | null;
    created_at: string;
}

export async function getTeamMembers(): Promise<{ success: boolean; data?: TeamMember[]; error?: string }> {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'Unauthorized' };
        }

        const serviceClient = await createServiceClient();

        // 1. Get current user's company_id
        const { data: currentUser, error: userError } = await serviceClient
            .from('hr_users')
            .select('company_id')
            .eq('id', user.id)
            .single();

        if (userError || !currentUser) {
            return { success: false, error: 'User profile not found' };
        }

        // 2. Get all users in the same company
        const { data: members, error: membersError } = await serviceClient
            .from('hr_users')
            .select('*')
            .eq('company_id', currentUser.company_id)
            .order('created_at', { ascending: false });

        if (membersError) {
            console.error('Error fetching team members:', membersError);
            return { success: false, error: 'Failed to load team members' };
        }

        return { success: true, data: members as TeamMember[] };

    } catch (error) {
        console.error('getTeamMembers Error:', error);
        return { success: false, error: 'Internal Server Error' };
    }
}

export async function getCurrentUserProfile() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const serviceClient = await createServiceClient();
        const { data } = await serviceClient
            .from('hr_users')
            .select('full_name, role, email, avatar_url')
            .eq('id', user.id)
            .single();

        return data || null;
    } catch {
        return null;
    }
}

export async function createUser(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const serviceClient = await createServiceClient();

    // 1. Verify Admin Role
    const { data: requester } = await serviceClient
        .from('hr_users')
        .select('role, company_id')
        .eq('id', user.id)
        .single();

    if (!requester || requester.role !== 'admin') {
        return { error: 'Hanya Administrator yang dapat menambah user.' };
    }

    // 2. Create Auth User
    const { data: newUser, error: createError } = await serviceClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name }
    });

    if (createError) {
        return { error: `Gagal membuat user auth: ${createError.message}` };
    }

    if (!newUser.user) {
        return { error: 'User auth tidak terbentuk.' };
    }

    // 3. Create DB Record
    const { error: dbError } = await serviceClient
        .from('hr_users')
        .insert({
            id: newUser.user.id,
            company_id: requester.company_id,
            full_name: name,
            email: email,
            role: role
        });

    if (dbError) {
        // Rollback is tricky without full transaction support across Auth+DB, 
        // but let's try to delete the auth user
        await serviceClient.auth.admin.deleteUser(newUser.user.id);
        return { error: `Gagal menyimpan profil: ${dbError.message}` };
    }

    revalidatePath('/dashboard/team');
    return { success: true };
}
