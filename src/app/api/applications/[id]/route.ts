import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/resend';
import { EMAIL_TRIGGERS, replaceEmailVariables, getEmailTriggerKey } from '@/constants/emailTemplates';
import { PIPELINE_STAGES, getStageByStatus } from '@/constants/stages';
import type { ApplicationStatus } from '@/types';

// GET /api/applications/[id] - Get application details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('applications')
            .select(`
        *,
        applicant:applicants(
          *,
          work_experiences(*),
          education(*),
          skills(*)
        ),
        job:jobs(*),
        activity_logs(*)
      `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Application not found' }, { status: 404 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Get application error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH /api/applications/[id] - Update application status (triggers email)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { status, hr_notes, score, interview_date, send_email = true } = body;

        // Get current application
        const { data: currentApp } = await supabase
            .from('applications')
            .select(`
        *,
        applicant:applicants(full_name, email),
        job:jobs(title, companies(name))
      `)
            .eq('id', id)
            .single();

        if (!currentApp) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        const oldStatus = currentApp.status;
        const newStatus = status || oldStatus;
        const newStage = getStageByStatus(newStatus as ApplicationStatus);

        // Update application
        const updateData: Record<string, unknown> = {};
        if (status) {
            updateData.status = status;
            updateData.stage_order = newStage.order;
        }
        if (hr_notes !== undefined) updateData.hr_notes = hr_notes;
        if (score !== undefined) updateData.score = score;
        if (interview_date !== undefined) updateData.interview_date = interview_date;

        const { data: updated, error: updateError } = await supabase
            .from('applications')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating application:', updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // Log activity
        if (status && status !== oldStatus) {
            await supabase.from('activity_logs').insert({
                company_id: currentApp.company_id,
                application_id: id,
                hr_user_id: user.id,
                action: `Status changed from ${oldStatus} to ${status}`,
                old_value: oldStatus,
                new_value: status,
                metadata: { hr_notes, score },
            });

            // Send email notification if status changed
            if (send_email && currentApp.applicant) {
                const isPass = newStatus !== 'rejected';
                const triggerKey = getEmailTriggerKey(
                    isPass ? newStatus : oldStatus,
                    isPass
                );

                const emailTrigger = EMAIL_TRIGGERS[triggerKey];

                if (emailTrigger) {
                    const emailBody = replaceEmailVariables(emailTrigger.defaultBody, {
                        applicant_name: currentApp.applicant.full_name,
                        job_title: currentApp.job?.title || '',
                        company_name: currentApp.job?.companies?.name || 'SmartRecruit',
                        tracking_id: currentApp.tracking_id,
                        interview_date: interview_date
                            ? new Date(interview_date).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })
                            : '',
                    });

                    const emailResult = await sendEmail({
                        to: currentApp.applicant.email,
                        subject: replaceEmailVariables(emailTrigger.subject, {
                            job_title: currentApp.job?.title || '',
                            company_name: currentApp.job?.companies?.name || 'SmartRecruit',
                        }),
                        body: emailBody,
                    });

                    // Log email
                    await supabase.from('email_logs').insert({
                        application_id: id,
                        recipient_email: currentApp.applicant.email,
                        subject: emailTrigger.subject,
                        body: emailBody,
                        status: emailResult.success ? 'sent' : 'failed',
                        sent_at: emailResult.success ? new Date().toISOString() : null,
                        error_message: emailResult.success ? null : emailResult.error,
                    });
                }
            }
        }

        return NextResponse.json({
            ...updated,
            email_sent: send_email && status !== oldStatus,
        });
    } catch (error) {
        console.error('Update application error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
