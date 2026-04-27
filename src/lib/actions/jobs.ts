'use server';

import { createClient, createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { appConfig } from '@/lib/config';

export async function createJobAction(jobData: any) {
    // 1. Mock Data Bypass
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        console.log('[MOCK MODE] Simulating job creation:', jobData);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
    }

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized: Harap login kembali.' };
        }

        const serviceClient = await createServiceClient();

        // 2. Get User's Company ID
        const { data: hrUser, error: hrError } = await serviceClient
            .from('hr_users')
            .select('company_id')
            .eq('id', user.id)
            .single();

        if (hrError || !hrUser) {
            return { success: false, error: 'Profil HR tidak ditemukan atau tidak terhubung ke perusahaan.' };
        }

        // 3. Insert Job Data
        // Ensure jobData doesn't contain undefined fields that Supabase dislikes, or fields strict schema forbids
        // We assume jobData fits the shape.

        const { error: insertError } = await serviceClient
            .from('jobs')
            .insert({
                title: jobData.title,
                department: jobData.department,
                location: jobData.location,
                type: jobData.type,
                salary_min: jobData.salary_min,
                salary_max: jobData.salary_max,
                description: jobData.description,
                requirements: jobData.requirements,
                benefits: jobData.benefits,
                status: jobData.status,
                expires_at: jobData.expires_at || null,
                company_id: hrUser.company_id,
                created_by: user.id
            });

        if (insertError) {
            console.error('Insert Job Error:', insertError);
            return { success: false, error: `Database Error: ${insertError.message}` };
        }

        revalidatePath('/dashboard/jobs');
        revalidatePath('/'); // Revalidate public home page just in case
        return { success: true };

    } catch (error) {
        console.error('Create Job Exception:', error);
        return { success: false, error: 'Internal Server Error' };
    }
}
