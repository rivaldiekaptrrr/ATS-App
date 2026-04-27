import { createClient } from '@/lib/supabase/client';
import {
    appConfig,
    mockCandidates,
    mockDashboardStats,
    mockDashboardJobs,
    mockPipelineSummary,
    mockRecentApplications
} from '@/lib/config';

// ============================================
// TYPES
// ============================================

export interface DashboardStats {
    totalApplicants: number;
    activeJobs: number;
    hiredThisMonth: number;
    avgTimeToHire: number;
}

export interface DashboardJob {
    id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    status: 'draft' | 'active' | 'closed';
    applicants: number;
    created_at: string;
}

export interface Candidate {
    id: string;
    tracking_id: string;
    name: string;
    email: string;
    phone?: string;
    position: string;
    status: string;
    score?: number | null;
    applied_at: string;
}

export interface PipelineCandidate {
    id: string;
    name: string;
    email: string;
    position: string;
    status: string;
    avatar?: string;
}

// ============================================
// GET DASHBOARD STATS
// ============================================
export async function getDashboardStats(): Promise<DashboardStats> {
    if (appConfig.useMockData) {
        console.log('[MOCK MODE] Returning mock dashboard stats');
        return mockDashboardStats;
    }

    const supabase = createClient();

    // Get total applicants
    const { count: totalApplicants } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true });

    // Get active jobs count
    const { count: activeJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

    // Get hired this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: hiredThisMonth } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'hired')
        .gte('updated_at', startOfMonth.toISOString());

    return {
        totalApplicants: totalApplicants || 0,
        activeJobs: activeJobs || 0,
        hiredThisMonth: hiredThisMonth || 0,
        avgTimeToHire: 18, // TODO: Calculate from actual data
    };
}

// ============================================
// GET DASHBOARD JOBS (with applicant count)
// ============================================
export async function getDashboardJobs(): Promise<DashboardJob[]> {
    if (appConfig.useMockData) {
        console.log('[MOCK MODE] Returning mock dashboard jobs');
        return mockDashboardJobs as DashboardJob[];
    }

    const supabase = createClient();

    // Get jobs with application count
    const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching dashboard jobs:', error);
        return [];
    }

    // Get application counts for each job
    const jobsWithCounts = await Promise.all(
        (jobs || []).map(async (job) => {
            const { count } = await supabase
                .from('applications')
                .select('*', { count: 'exact', head: true })
                .eq('job_id', job.id);

            return {
                ...job,
                applicants: count || 0,
            };
        })
    );

    return jobsWithCounts as DashboardJob[];
}

// ============================================
// GET CANDIDATES
// ============================================
export async function getCandidates(): Promise<Candidate[]> {
    if (appConfig.useMockData) {
        console.log('[MOCK MODE] Returning mock candidates');
        return mockCandidates as Candidate[];
    }

    const supabase = createClient();

    const { data, error } = await supabase
        .from('applications')
        .select(`
            id,
            tracking_id,
            status,
            score,
            created_at,
            applicants (
                full_name,
                email,
                phone
            ),
            jobs (
                title
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching candidates:', error);
        return [];
    }

    return (data || []).map((app: any) => ({
        id: app.id,
        tracking_id: app.tracking_id,
        name: app.applicants?.full_name || 'Unknown',
        email: app.applicants?.email || '',
        phone: app.applicants?.phone || '',
        position: app.jobs?.title || 'Unknown Position',
        status: app.status,
        score: app.score,
        applied_at: app.created_at,
    }));
}

// ============================================
// GET PIPELINE CANDIDATES
// ============================================
export async function getPipelineCandidates(): Promise<PipelineCandidate[]> {
    if (appConfig.useMockData) {
        console.log('[MOCK MODE] Returning mock pipeline candidates');
        return mockCandidates.map(c => ({
            id: c.id,
            name: c.name,
            email: c.email,
            position: c.position,
            status: c.status,
        }));
    }

    const supabase = createClient();

    const { data, error } = await supabase
        .from('applications')
        .select(`
            id,
            status,
            applicants (
                full_name,
                email
            ),
            jobs (
                title
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching pipeline candidates:', error);
        return [];
    }

    return (data || []).map((app: any) => ({
        id: app.id,
        name: app.applicants?.full_name || 'Unknown',
        email: app.applicants?.email || '',
        position: app.jobs?.title || 'Unknown Position',
        status: app.status,
    }));
}

// ============================================
// GET PIPELINE SUMMARY
// ============================================
export async function getPipelineSummary(): Promise<{ status: string; count: number }[]> {
    if (appConfig.useMockData) {
        console.log('[MOCK MODE] Returning mock pipeline summary');
        return mockPipelineSummary;
    }

    const supabase = createClient();

    const statuses = ['applied', 'screening', 'interview_1', 'interview_2', 'interview_3', 'test', 'offering', 'hired'];

    const summary = await Promise.all(
        statuses.map(async (status) => {
            const { count } = await supabase
                .from('applications')
                .select('*', { count: 'exact', head: true })
                .eq('status', status);

            return { status, count: count || 0 };
        })
    );

    return summary;
}

// ============================================
// GET RECENT APPLICATIONS
// ============================================
export async function getRecentApplications() {
    if (appConfig.useMockData) {
        console.log('[MOCK MODE] Returning mock recent applications');
        return mockRecentApplications;
    }

    const supabase = createClient();

    const { data, error } = await supabase
        .from('applications')
        .select(`
            id,
            status,
            created_at,
            applicants (
                full_name
            ),
            jobs (
                title
            )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching recent applications:', error);
        return [];
    }

    return (data || []).map((app: any) => {
        const createdAt = new Date(app.created_at);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));

        let time = 'Baru';
        if (diffHours < 1) time = 'Baru';
        else if (diffHours < 24) time = `${diffHours} jam lalu`;
        else time = `${Math.floor(diffHours / 24)} hari lalu`;

        return {
            id: app.id,
            name: app.applicants?.full_name || 'Unknown',
            position: app.jobs?.title || 'Unknown Position',
            status: app.status,
            time,
        };
    });
}

// ============================================
// UPDATE APPLICATION STATUS
// ============================================
export async function updateApplicationStatus(id: string, status: string): Promise<boolean> {
    if (appConfig.useMockData) {
        console.log('[MOCK MODE] Simulating status update:', id, status);
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
    }

    const supabase = createClient();

    const { error } = await supabase
        .from('applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        console.error('Error updating application status:', error);
        return false;
    }

    return true;
}
