import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server'; // Use service client for admin tasks

export async function GET(request: NextRequest) {
    try {
        const serviceClient = await createServiceClient();

        // 1. Create Default Company
        // We use upsert to avoid error if it already exists
        const { data: company, error: companyError } = await serviceClient
            .from('companies')
            .upsert({
                slug: 'smartrecruit-demo', // Fixed slug for single tenant
                name: 'SmartRecruit Demo',
                primary_color: '#3B82F6',
                parsing_config: { engine: 'library' }
            }, { onConflict: 'slug' })
            .select('id')
            .single();

        if (companyError) {
            return NextResponse.json({ error: 'Company Create Error: ' + companyError.message }, { status: 500 });
        }

        // 2. Create Auth User (We can't do this via SQL easily, needs Admin API)
        // Since we are in Next.js, we can try to createUser using Admin Auth Client
        // Note: serviceClient.auth.admin requires service_role key
        const email = 'hr@smartrecruit.com';
        const password = 'password123';

        // Check if user exists first to get ID
        const { data: { users } } = await serviceClient.auth.admin.listUsers();
        let userId = users.find(u => u.email === email)?.id;

        if (!userId) {
            const { data: newUser, error: createUserError } = await serviceClient.auth.admin.createUser({
                email: email,
                password: password,
                email_confirm: true, // Auto confirm
                user_metadata: { full_name: 'HR Admin' }
            });

            if (createUserError) {
                return NextResponse.json({ error: 'Auth Create Error: ' + createUserError.message }, { status: 500 });
            }
            userId = newUser.user.id;
        }

        // 3. Link User to Company (HR User)
        const { error: hrError } = await serviceClient
            .from('hr_users')
            .upsert({
                id: userId,
                company_id: company.id,
                full_name: 'HR Admin',
                email: email,
                role: 'admin'
            }, { onConflict: 'id' });

        if (hrError) {
            return NextResponse.json({ error: 'HR Link Error: ' + hrError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Seed finished! You can now login with hr@smartrecruit.com / password123'
        });

    } catch (error) {
        console.error('Seed Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
