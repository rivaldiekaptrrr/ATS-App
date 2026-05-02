// ============================================
// EMAIL AUTOMATION SERVICE
// ============================================
// Triggers emails automatically when application status changes
// Works in mock mode (logs to console) and real mode (Resend API)

import { appConfig } from '@/lib/config';
import {
    EMAIL_TRIGGERS,
    getEmailTriggerKey,
    replaceEmailVariables,
} from '@/constants/emailTemplates';
import type { ApplicationStatus } from '@/types';

export interface EmailPayload {
    candidateName: string;
    candidateEmail: string;
    jobTitle: string;
    companyName: string;
    trackingId: string;
    newStatus: ApplicationStatus;
    isPass: boolean; // true = moving forward, false = rejected
}

export interface EmailResult {
    sent: boolean;
    message: string;
    mockMode?: boolean;
}

// ============================================
// SEND STATUS CHANGE EMAIL
// ============================================
export async function sendStatusChangeEmail(payload: EmailPayload): Promise<EmailResult> {
    const {
        candidateName,
        candidateEmail,
        jobTitle,
        companyName,
        trackingId,
        newStatus,
        isPass,
    } = payload;

    // Get the right email template key
    const triggerKey = getEmailTriggerKey(newStatus, isPass);
    const trigger = EMAIL_TRIGGERS[triggerKey];

    if (!trigger) {
        console.warn('[EMAIL] No template found for trigger key:', triggerKey);
        return { sent: false, message: 'No email template found for this status' };
    }

    const variables = {
        applicant_name: candidateName,
        job_title: jobTitle,
        company_name: companyName,
        tracking_id: trackingId,
    };

    const processedSubject = replaceEmailVariables(trigger.subject, variables);
    const processedBody = replaceEmailVariables(trigger.defaultBody, variables);

    // MOCK MODE: Simulate email sending
    if (appConfig.useMockData) {
        console.log('[MOCK EMAIL] Would send email to:', candidateEmail);
        console.log('[MOCK EMAIL] Subject:', processedSubject);
        console.log('[MOCK EMAIL] Body:', processedBody.substring(0, 100) + '...');

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 400));

        return {
            sent: true,
            message: `Email notifikasi dikirim ke ${candidateEmail} (Mode Demo)`,
            mockMode: true,
        };
    }

    // REAL MODE: Call the API route
    try {
        const response = await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: candidateEmail,
                subject: processedSubject,
                body: processedBody,
                variables,
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            return { sent: false, message: err.error || 'Gagal mengirim email' };
        }

        return {
            sent: true,
            message: `Email notifikasi berhasil dikirim ke ${candidateEmail}`,
        };
    } catch (error) {
        console.error('[EMAIL] Failed to send:', error);
        return { sent: false, message: 'Gagal mengirim email: Network error' };
    }
}

// ============================================
// SEND APPLICATION RECEIVED EMAIL
// ============================================
export async function sendApplicationReceivedEmail(payload: {
    candidateName: string;
    candidateEmail: string;
    jobTitle: string;
    companyName: string;
    trackingId: string;
}): Promise<EmailResult> {
    return sendStatusChangeEmail({
        ...payload,
        newStatus: 'applied',
        isPass: true,
    });
}

// ============================================
// GET EMAIL PREVIEW
// ============================================
export function getEmailPreview(
    status: ApplicationStatus,
    isPass: boolean,
    variables: {
        applicant_name: string;
        job_title: string;
        company_name: string;
        tracking_id: string;
    }
): { subject: string; body: string } | null {
    const triggerKey = getEmailTriggerKey(status, isPass);
    const trigger = EMAIL_TRIGGERS[triggerKey];

    if (!trigger) return null;

    return {
        subject: replaceEmailVariables(trigger.subject, variables),
        body: replaceEmailVariables(trigger.defaultBody, variables),
    };
}
