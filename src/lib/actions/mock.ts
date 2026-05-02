'use server';
import { addMockApplication } from '@/lib/services/dashboard';

export async function addMockCandidateAction(candidate: any) {
    try {
        addMockApplication(candidate);
        return { success: true };
    } catch (error) {
        console.error('Error adding mock candidate:', error);
        return { success: false };
    }
}
