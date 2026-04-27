'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface CompanySettings {
    id: string;
    name: string;
    email?: string;
    logo_url?: string;
    primary_color: string;
    domain?: string;
    slug: string;
    parsing_config?: any; // JSONB
}

export type ActionResponse = {
    success: boolean;
    message: string;
    data?: any;
};

export async function getCompanySettings(): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, message: 'Unauthorized' };
        }

        const serviceClient = await createServiceClient();

        const { data: hrUser, error: hrError } = await serviceClient
            .from('hr_users')
            .select('company_id, role')
            .eq('id', user.id)
            .single();

        if (hrError || !hrUser) {
            return { success: false, message: 'User profile not found.' };
        }

        const { data: company, error: companyError } = await serviceClient
            .from('companies')
            .select('*')
            .eq('id', hrUser.company_id)
            .single();

        // Mask sensitive data for non-admins
        if (hrUser.role !== 'admin' && company) {
            company.parsing_config = undefined; // Hide API Keys
        }

        if (companyError || !company) {
            return { success: false, message: 'Company not found.' };
        }

        return {
            success: true,
            message: 'Settings fetched',
            data: company
        };

    } catch (error) {
        console.error('getCompanySettings Error:', error);
        return { success: false, message: 'Internal Server Error' };
    }
}

export async function updateCompanySettings(data: Partial<CompanySettings>): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, message: 'Unauthorized' };
        }

        const serviceClient = await createServiceClient();

        const { data: hrUser, error: hrError } = await serviceClient
            .from('hr_users')
            .select('company_id, role')
            .eq('id', user.id)
            .single();

        if (hrError || !hrUser) {
            console.error('UpdateSettings Error:', { userId: user.id, hrError });
            return {
                success: false,
                message: `User profile not found. ID: ${user.id}. DB Err: ${hrError?.message || 'No Data'}`
            };
        }

        if (hrUser.role !== 'admin') {
            return { success: false, message: 'Akses Ditolak. Hanya Administrator yang dapat mengubah pengaturan.' };
        }

        // Prepare update object
        const updateData: any = {
            updated_at: new Date().toISOString()
        };

        if (data.name) updateData.name = data.name;
        if (data.logo_url) updateData.logo_url = data.logo_url;
        if (data.primary_color) updateData.primary_color = data.primary_color;
        if (data.domain) updateData.domain = data.domain;
        if (data.parsing_config) updateData.parsing_config = data.parsing_config;

        const { error: updateError } = await serviceClient
            .from('companies')
            .update(updateData)
            .eq('id', hrUser.company_id);

        if (updateError) {
            console.error('Update Error:', updateError);
            return { success: false, message: 'Failed to update settings. ' + updateError.message };
        }

        revalidatePath('/dashboard/settings');
        return { success: true, message: 'Settings updated successfully' };

    } catch (error) {
        console.error('updateCompanySettings Error:', error);
        return { success: false, message: 'Internal Server Error' };
    }
}
