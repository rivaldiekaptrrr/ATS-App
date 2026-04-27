'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Application, ApplicationWithDetails, ApplicationStatus } from '@/types';

// Fetch all applications
export function useApplications(filters?: { status?: string; job_id?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.job_id) params.set('job_id', filters.job_id);

    return useQuery({
        queryKey: ['applications', filters],
        queryFn: async () => {
            const res = await fetch(`/api/applications?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch applications');
            return res.json() as Promise<ApplicationWithDetails[]>;
        },
    });
}

// Fetch single application
export function useApplication(id: string) {
    return useQuery({
        queryKey: ['application', id],
        queryFn: async () => {
            const res = await fetch(`/api/applications/${id}`);
            if (!res.ok) throw new Error('Failed to fetch application');
            return res.json();
        },
        enabled: !!id,
    });
}

// Track application
export function useTrackApplication(trackingId: string, email: string) {
    return useQuery({
        queryKey: ['track', trackingId, email],
        queryFn: async () => {
            const params = new URLSearchParams({
                tracking_id: trackingId,
                email: email,
            });
            const res = await fetch(`/api/applications/track?${params.toString()}`);
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to track application');
            }
            return res.json();
        },
        enabled: !!trackingId && !!email,
        retry: false,
    });
}

// Submit application
export function useSubmitApplication() {
    return useMutation({
        mutationFn: async (data: {
            job_id: string;
            applicant: {
                full_name: string;
                email: string;
                phone?: string;
                address?: string;
                bio?: string;
                linkedin_url?: string;
                portfolio_url?: string;
            };
            cv_url?: string;
            cv_filename?: string;
            work_experiences?: Array<{
                company_name: string;
                position: string;
                start_date?: string;
                end_date?: string;
                is_current?: boolean;
                description?: string;
            }>;
            education?: Array<{
                institution: string;
                degree?: string;
                field_of_study?: string;
                start_year?: number;
                end_year?: number;
                gpa?: number;
            }>;
            skills?: Array<{
                name: string;
                level?: string;
            }>;
        }) => {
            const res = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to submit application');
            }
            return res.json();
        },
    });
}

// Update application status
export function useUpdateApplicationStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            status,
            hr_notes,
            score,
            interview_date,
            send_email = true
        }: {
            id: string;
            status?: ApplicationStatus;
            hr_notes?: string;
            score?: number;
            interview_date?: string;
            send_email?: boolean;
        }) => {
            const res = await fetch(`/api/applications/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, hr_notes, score, interview_date, send_email }),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to update application');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
    });
}
