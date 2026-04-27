import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/resend';
import { replaceEmailVariables } from '@/constants/emailTemplates';

// POST /api/email/send - Send custom email (HR only)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { application_id, to, subject, body: emailBody, variables } = body;

        if (!to || !subject || !emailBody) {
            return NextResponse.json(
                { error: 'Recipient, subject, dan body wajib diisi' },
                { status: 400 }
            );
        }

        // Replace variables if provided
        const processedSubject = variables
            ? replaceEmailVariables(subject, variables)
            : subject;
        const processedBody = variables
            ? replaceEmailVariables(emailBody, variables)
            : emailBody;

        // Send email
        const result = await sendEmail({
            to,
            subject: processedSubject,
            body: processedBody,
        });

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        // Log email if application_id provided
        if (application_id) {
            const { data: app } = await supabase
                .from('applications')
                .select('company_id')
                .eq('id', application_id)
                .single();

            await supabase.from('email_logs').insert({
                application_id,
                recipient_email: to,
                subject: processedSubject,
                body: processedBody,
                status: 'sent',
                sent_at: new Date().toISOString(),
            });

            // Also log activity
            if (app) {
                await supabase.from('activity_logs').insert({
                    company_id: app.company_id,
                    application_id,
                    hr_user_id: user.id,
                    action: `Manual email sent: ${processedSubject}`,
                    metadata: { to, subject: processedSubject },
                });
            }
        }

        return NextResponse.json({
            success: true,
            message_id: result.id
        });
    } catch (error) {
        console.error('Send email error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
