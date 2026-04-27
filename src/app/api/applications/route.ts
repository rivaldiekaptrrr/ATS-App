import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/resend';
import { EMAIL_TRIGGERS, replaceEmailVariables } from '@/constants/emailTemplates';

// Helper to generate tracking ID
function generateTrackingId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'APP-';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// POST /api/applications - Submit new application (public)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServiceClient();
        const body = await request.json();

        const {
            job_id,
            applicant,
            cv_url,
            cv_filename,
            work_experiences,
            education,
            skills
        } = body;

        // Validate required fields
        if (!job_id || !applicant?.full_name || !applicant?.email) {
            return NextResponse.json(
                { error: 'Job ID, nama, dan email wajib diisi' },
                { status: 400 }
            );
        }

        // Get job and company info
        const { data: job, error: jobError } = await supabase
            .from('jobs')
            .select('*, companies(name)')
            .eq('id', job_id)
            .single();

        if (jobError || !job) {
            return NextResponse.json({ error: 'Job tidak ditemukan' }, { status: 404 });
        }

        // Check if already applied
        const { data: existing } = await supabase
            .from('applications')
            .select('id')
            .eq('job_id', job_id)
            .eq('applicant_id', (
                await supabase
                    .from('applicants')
                    .select('id')
                    .eq('email', applicant.email)
                    .single()
            ).data?.id || '')
            .single();

        if (existing) {
            return NextResponse.json(
                { error: 'Anda sudah melamar untuk posisi ini' },
                { status: 400 }
            );
        }

        // Create or get applicant
        let applicantId: string;

        const { data: existingApplicant } = await supabase
            .from('applicants')
            .select('id')
            .eq('email', applicant.email)
            .single();

        if (existingApplicant) {
            applicantId = existingApplicant.id;
            // Update applicant info
            await supabase
                .from('applicants')
                .update({
                    full_name: applicant.full_name,
                    phone: applicant.phone,
                    address: applicant.address,
                    bio: applicant.bio,
                    linkedin_url: applicant.linkedin_url,
                    portfolio_url: applicant.portfolio_url,
                    cv_url,
                    cv_filename,
                })
                .eq('id', applicantId);
        } else {
            const { data: newApplicant, error: applicantError } = await supabase
                .from('applicants')
                .insert({
                    ...applicant,
                    cv_url,
                    cv_filename,
                })
                .select()
                .single();

            if (applicantError) {
                console.error('Error creating applicant:', applicantError);
                return NextResponse.json({ error: applicantError.message }, { status: 500 });
            }
            applicantId = newApplicant.id;
        }

        // Add work experiences
        if (work_experiences?.length > 0) {
            await supabase
                .from('work_experiences')
                .insert(work_experiences.map((exp: Record<string, unknown>) => ({
                    ...exp,
                    applicant_id: applicantId,
                })));
        }

        // Add education
        if (education?.length > 0) {
            await supabase
                .from('education')
                .insert(education.map((edu: Record<string, unknown>) => ({
                    ...edu,
                    applicant_id: applicantId,
                })));
        }

        // Add skills
        if (skills?.length > 0) {
            await supabase
                .from('skills')
                .insert(skills.map((skill: Record<string, unknown>) => ({
                    ...skill,
                    applicant_id: applicantId,
                })));
        }

        // Create application
        const trackingId = generateTrackingId();

        const { data: application, error: appError } = await supabase
            .from('applications')
            .insert({
                tracking_id: trackingId,
                applicant_id: applicantId,
                job_id,
                company_id: job.company_id,
                status: 'applied',
                stage_order: 0,
            })
            .select()
            .single();

        if (appError) {
            console.error('Error creating application:', appError);
            return NextResponse.json({ error: appError.message }, { status: 500 });
        }

        // Send confirmation email
        const emailTrigger = EMAIL_TRIGGERS['applied'];
        const emailBody = replaceEmailVariables(emailTrigger.defaultBody, {
            applicant_name: applicant.full_name,
            job_title: job.title,
            company_name: job.companies?.name || 'SmartRecruit',
            tracking_id: trackingId,
        });

        await sendEmail({
            to: applicant.email,
            subject: replaceEmailVariables(emailTrigger.subject, { job_title: job.title }),
            body: emailBody,
        });

        // Log email
        await supabase.from('email_logs').insert({
            application_id: application.id,
            recipient_email: applicant.email,
            subject: emailTrigger.subject,
            body: emailBody,
            status: 'sent',
            sent_at: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            tracking_id: trackingId,
            application_id: application.id,
        }, { status: 201 });
    } catch (error) {
        console.error('Application submit error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET /api/applications - Get applications (HR only)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const jobId = searchParams.get('job_id');

        let query = supabase
            .from('applications')
            .select(`
        *,
        applicant:applicants(*),
        job:jobs(title, department)
      `)
            .order('created_at', { ascending: false });

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        if (jobId) {
            query = query.eq('job_id', jobId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching applications:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Applications API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
