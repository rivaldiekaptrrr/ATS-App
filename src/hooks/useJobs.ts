'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Job } from '@/types';

// Fetch all jobs
export function useJobs(status: string = 'active') {
    return useQuery({
        queryKey: ['jobs', status],
        queryFn: async () => {
            const res = await fetch(`/api/jobs?status=${status}`);
            if (!res.ok) throw new Error('Failed to fetch jobs');
            const data = await res.json();
            return data.jobs as Job[];
        },
    });
}

// Fetch single job
export function useJob(id: string) {
    return useQuery({
        queryKey: ['job', id],
        queryFn: async () => {
            const res = await fetch(`/api/jobs/${id}`);
            if (!res.ok) throw new Error('Failed to fetch job');
            return res.json() as Promise<Job>;
        },
        enabled: !!id,
    });
}

// Create job
export function useCreateJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (jobData: Partial<Job>) => {
            const res = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobData),
            });
            if (!res.ok) throw new Error('Failed to create job');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        },
    });
}

// Update job
export function useUpdateJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...data }: Partial<Job> & { id: string }) => {
            const res = await fetch(`/api/jobs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to update job');
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['job', variables.id] });
        },
    });
}

// Delete job
export function useDeleteJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/jobs/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete job');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        },
    });
}
