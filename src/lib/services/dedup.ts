// ============================================
// DUPLICATE DETECTION SERVICE
// ============================================
// Detects if a candidate has already applied to the same job

import { appConfig, mockCandidates } from '@/lib/config';

export interface DuplicateCheckResult {
    isDuplicate: boolean;
    existingApplication?: {
        tracking_id: string;
        applied_at: string;
        status: string;
    };
    message?: string;
}

// ============================================
// CHECK DUPLICATE (Mock + Real mode)
// ============================================
export async function checkDuplicateApplicant(
    email: string,
    jobId: string
): Promise<DuplicateCheckResult> {
    if (!email) {
        return { isDuplicate: false };
    }

    if (appConfig.useMockData) {
        console.log('[MOCK MODE] Checking duplicate for:', email, jobId);
        // Simulate a small delay
        await new Promise(resolve => setTimeout(resolve, 200));

        // In mock mode, check against mock candidates by email
        const existing = mockCandidates.find(c =>
            c.email.toLowerCase() === email.toLowerCase()
        );

        if (existing) {
            return {
                isDuplicate: true,
                existingApplication: {
                    tracking_id: existing.tracking_id,
                    applied_at: existing.applied_at,
                    status: existing.status,
                },
                message: `Email ini sudah terdaftar dengan ID Tracking: ${existing.tracking_id}`,
            };
        }

        return { isDuplicate: false };
    }

    // Real mode: query Supabase
    try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        // Find applicant by email
        const { data: applicant } = await supabase
            .from('applicants')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (!applicant) {
            return { isDuplicate: false };
        }

        // Check if this applicant already applied to this job
        const { data: application } = await supabase
            .from('applications')
            .select('tracking_id, created_at, status')
            .eq('applicant_id', applicant.id)
            .eq('job_id', jobId)
            .single();

        if (application) {
            return {
                isDuplicate: true,
                existingApplication: {
                    tracking_id: application.tracking_id,
                    applied_at: application.created_at,
                    status: application.status,
                },
                message: `Email ini sudah melamar posisi ini dengan ID Tracking: ${application.tracking_id}`,
            };
        }

        return { isDuplicate: false };
    } catch {
        // If query fails (e.g., no matching row), assume not duplicate
        return { isDuplicate: false };
    }
}

// ============================================
// FIND SIMILAR APPLICATIONS (for HR dashboard)
// ============================================
export async function findSimilarApplications(email: string): Promise<Array<{
    tracking_id: string;
    position: string;
    status: string;
    applied_at: string;
}>> {
    if (appConfig.useMockData) {
        const similar = mockCandidates.filter(c =>
            c.email.toLowerCase() === email.toLowerCase()
        );
        return similar.map(c => ({
            tracking_id: c.tracking_id,
            position: c.position,
            status: c.status,
            applied_at: c.applied_at,
        }));
    }

    try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        const { data: applicant } = await supabase
            .from('applicants')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (!applicant) return [];

        const { data: applications } = await supabase
            .from('applications')
            .select('tracking_id, created_at, status, jobs(title)')
            .eq('applicant_id', applicant.id)
            .order('created_at', { ascending: false });

        return (applications || []).map((app: {
            tracking_id: string;
            created_at: string;
            status: string;
            jobs?: { title?: string };
        }) => ({
            tracking_id: app.tracking_id,
            position: app.jobs?.title || 'Unknown',
            status: app.status,
            applied_at: app.created_at,
        }));
    } catch {
        return [];
    }
}
