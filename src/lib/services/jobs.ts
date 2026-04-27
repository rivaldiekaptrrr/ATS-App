import { createClient } from '@/lib/supabase/client';
import { appConfig, mockJobs, getMockJobById } from '@/lib/config';

export interface Job {
    id: string;
    company_id?: string;
    title: string;
    department: string;
    location: string;
    type: 'full-time' | 'part-time' | 'contract' | 'internship';
    salary_min?: number;
    salary_max?: number;
    description: string;
    requirements: string;
    benefits?: string;
    status: 'draft' | 'active' | 'closed';
    created_by?: string;
    created_at: string;
    updated_at: string;
    expires_at?: string;
    companies?: { name: string };
}

export interface CreateJobData {
    title: string;
    department: string;
    location: string;
    type: 'full-time' | 'part-time' | 'contract' | 'internship';
    salary_min?: number;
    salary_max?: number;
    description: string;
    requirements: string;
    benefits?: string;
    status: 'draft' | 'active';
    expires_at?: string;
}

// ============================================
// GET ACTIVE JOBS (for public job listing page)
// ============================================
export async function getActiveJobs(): Promise<Job[]> {
    // Use mock data if configured
    if (appConfig.useMockData) {
        console.log('[MOCK MODE] Returning mock jobs');
        return mockJobs.filter(job => job.status === 'active') as Job[];
    }

    const supabase = createClient();

    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching active jobs:', error);
        return [];
    }

    return data as Job[];
}

// ============================================
// GET ALL JOBS (for HR dashboard - all statuses)
// ============================================
export async function getAllJobs(): Promise<Job[]> {
    if (appConfig.useMockData) {
        console.log('[MOCK MODE] Returning all mock jobs');
        return mockJobs as Job[];
    }

    const supabase = createClient();

    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching jobs:', error);
        return [];
    }

    return data as Job[];
}

// ============================================
// GET JOB BY ID
// ============================================
export async function getJobById(id: string): Promise<Job | null> {
    if (appConfig.useMockData) {
        console.log('[MOCK MODE] Returning mock job by ID:', id);
        return getMockJobById(id) as Job | null;
    }

    const supabase = createClient();

    const { data, error } = await supabase
        .from('jobs')
        .select('*, companies(name)')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching job:', error);
        return null;
    }

    return data as Job;
}

// ============================================
// CREATE NEW JOB
// ============================================
export async function createJob(jobData: CreateJobData): Promise<Job> {
    if (appConfig.useMockData) {
        console.log('[MOCK MODE] Simulating job creation:', jobData);
        // Simulate successful creation
        const newJob: Job = {
            id: `mock-${Date.now()}`,
            ...jobData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return newJob;
    }

    const supabase = createClient();

    // Get the first company from database (for MVP single-tenant setup)
    const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .single();

    if (companyError || !companies) {
        console.error('Error fetching company:', companyError);
        throw new Error('Company not found. Please run the database schema first.');
    }

    const { data, error } = await supabase
        .from('jobs')
        .insert([
            {
                ...jobData,
                company_id: companies.id,
            },
        ])
        .select()
        .single();

    if (error) {
        console.error('Error creating job:', error);
        throw error;
    }

    return data as Job;
}

// ============================================
// UPDATE JOB
// ============================================
export async function updateJob(id: string, jobData: Partial<CreateJobData>): Promise<Job> {
    if (appConfig.useMockData) {
        console.log('[MOCK MODE] Simulating job update:', id, jobData);
        const existingJob = getMockJobById(id);
        if (!existingJob) throw new Error('Job not found');
        await new Promise(resolve => setTimeout(resolve, 500));
        return { ...existingJob, ...jobData, updated_at: new Date().toISOString() } as Job;
    }

    const supabase = createClient();

    const { data, error } = await supabase
        .from('jobs')
        .update(jobData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating job:', error);
        throw error;
    }

    return data as Job;
}

// ============================================
// DELETE JOB
// ============================================
export async function deleteJob(id: string): Promise<boolean> {
    if (appConfig.useMockData) {
        console.log('[MOCK MODE] Simulating job deletion:', id);
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
    }

    const supabase = createClient();

    const { error } = await supabase.from('jobs').delete().eq('id', id);

    if (error) {
        console.error('Error deleting job:', error);
        throw error;
    }

    return true;
}

// ============================================
// UPDATE JOB STATUS
// ============================================
export async function updateJobStatus(id: string, status: 'draft' | 'active' | 'closed'): Promise<Job> {
    if (appConfig.useMockData) {
        console.log('[MOCK MODE] Simulating status update:', id, status);
        const existingJob = getMockJobById(id);
        if (!existingJob) throw new Error('Job not found');
        await new Promise(resolve => setTimeout(resolve, 500));
        return { ...existingJob, status, updated_at: new Date().toISOString() } as Job;
    }

    const supabase = createClient();

    const { data, error } = await supabase
        .from('jobs')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating job status:', error);
        throw error;
    }

    return data as Job;
}
