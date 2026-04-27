import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// GET /api/applications/track - Track application by tracking_id and email
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServiceClient();
        const { searchParams } = new URL(request.url);

        const trackingId = searchParams.get('tracking_id');
        const email = searchParams.get('email');

        if (!trackingId || !email) {
            return NextResponse.json(
                { error: 'Tracking ID dan email diperlukan' },
                { status: 400 }
            );
        }

        // Find application
        const { data: application, error } = await supabase
            .from('applications')
            .select(`
        id,
        tracking_id,
        status,
        stage_order,
        created_at,
        updated_at,
        job:jobs(title, department, companies(name))
      `)
            .eq('tracking_id', trackingId.toUpperCase())
            .single();

        if (error || !application) {
            return NextResponse.json(
                { error: 'Lamaran tidak ditemukan' },
                { status: 404 }
            );
        }

        // Verify email matches
        const { data: applicant } = await supabase
            .from('applicants')
            .select('email')
            .eq('id', (
                await supabase
                    .from('applications')
                    .select('applicant_id')
                    .eq('id', application.id)
                    .single()
            ).data?.applicant_id)
            .single();

        if (!applicant || applicant.email.toLowerCase() !== email.toLowerCase()) {
            return NextResponse.json(
                { error: 'Email tidak cocok dengan data lamaran' },
                { status: 403 }
            );
        }

        // Get activity logs
        const { data: history } = await supabase
            .from('activity_logs')
            .select('action, old_value, new_value, created_at')
            .eq('application_id', application.id)
            .order('created_at', { ascending: true });

        return NextResponse.json({
            ...application,
            history: history || [],
        });
    } catch (error) {
        console.error('Track application error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
