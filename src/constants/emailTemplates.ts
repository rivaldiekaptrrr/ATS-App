export interface EmailTrigger {
    subject: string;
    event: string;
    defaultBody: string;
}

export const EMAIL_TRIGGERS: Record<string, EmailTrigger> = {
    'applied': {
        subject: 'Konfirmasi Lamaran Diterima - {{job_title}}',
        event: 'APPLICATION_RECEIVED',
        defaultBody: `Yth. {{applicant_name}},

Terima kasih telah melamar posisi {{job_title}} di {{company_name}}.

Lamaran Anda telah kami terima dengan ID Tracking: {{tracking_id}}.

Kami akan meninjau lamaran Anda dan menghubungi Anda kembali secepatnya.

Salam,
Tim HR {{company_name}}`
    },
    'screening_pass': {
        subject: 'Selamat! Anda Lolos Tahap Administrasi - {{company_name}}',
        event: 'SCREENING_PASSED',
        defaultBody: `Yth. {{applicant_name}},

Selamat! Lamaran Anda untuk posisi {{job_title}} telah lolos tahap screening administrasi.

Kami akan segera menghubungi Anda untuk tahap selanjutnya.

Salam,
Tim HR {{company_name}}`
    },
    'screening_reject': {
        subject: 'Update Status Lamaran Anda - {{company_name}}',
        event: 'SCREENING_REJECTED',
        defaultBody: `Yth. {{applicant_name}},

Terima kasih atas minat Anda untuk bergabung dengan {{company_name}}.

Setelah meninjau lamaran Anda untuk posisi {{job_title}}, kami menyesal untuk memberitahukan bahwa kami tidak dapat melanjutkan proses rekrutmen Anda saat ini.

Kami menyimpan data Anda untuk peluang di masa mendatang.

Salam,
Tim HR {{company_name}}`
    },
    'interview_1_pass': {
        subject: 'Undangan Interview Tahap 1 - {{company_name}}',
        event: 'INTERVIEW_1_SCHEDULED',
        defaultBody: `Yth. {{applicant_name}},

Selamat! Anda diundang untuk mengikuti Interview Tahap 1 untuk posisi {{job_title}}.

Detail akan diinformasikan lebih lanjut.

Salam,
Tim HR {{company_name}}`
    },
    'interview_1_reject': {
        subject: 'Update Status Lamaran Anda - {{company_name}}',
        event: 'INTERVIEW_1_REJECTED',
        defaultBody: `Yth. {{applicant_name}},

Terima kasih telah mengikuti Interview Tahap 1 untuk posisi {{job_title}}.

Setelah pertimbangan matang, kami menyesal harus memberitahukan bahwa kami tidak dapat melanjutkan proses rekrutmen Anda.

Salam,
Tim HR {{company_name}}`
    },
    'interview_2_pass': {
        subject: 'Undangan Interview Tahap 2 - {{company_name}}',
        event: 'INTERVIEW_2_SCHEDULED',
        defaultBody: `Yth. {{applicant_name}},

Selamat! Anda lolos Interview Tahap 1 dan diundang untuk Interview Tahap 2 untuk posisi {{job_title}}.

Detail akan diinformasikan lebih lanjut.

Salam,
Tim HR {{company_name}}`
    },
    'interview_2_reject': {
        subject: 'Update Status Lamaran Anda - {{company_name}}',
        event: 'INTERVIEW_2_REJECTED',
        defaultBody: `Yth. {{applicant_name}},

Terima kasih telah mengikuti Interview Tahap 2 untuk posisi {{job_title}}.

Setelah pertimbangan matang, kami menyesal harus memberitahukan bahwa kami tidak dapat melanjutkan proses rekrutmen Anda.

Salam,
Tim HR {{company_name}}`
    },
    'interview_3_pass': {
        subject: 'Undangan Interview Final - {{company_name}}',
        event: 'INTERVIEW_3_SCHEDULED',
        defaultBody: `Yth. {{applicant_name}},

Selamat! Anda lolos Interview Tahap 2 dan diundang untuk Interview Final (Tahap 3) untuk posisi {{job_title}}.

Detail akan diinformasikan lebih lanjut.

Salam,
Tim HR {{company_name}}`
    },
    'interview_3_reject': {
        subject: 'Update Status Lamaran Anda - {{company_name}}',
        event: 'INTERVIEW_3_REJECTED',
        defaultBody: `Yth. {{applicant_name}},

Terima kasih telah mengikuti Interview Final untuk posisi {{job_title}}.

Setelah pertimbangan matang, kami menyesal harus memberitahukan bahwa kami tidak dapat melanjutkan proses rekrutmen Anda.

Salam,
Tim HR {{company_name}}`
    },
    'test_pass': {
        subject: 'Hasil Test - {{company_name}}',
        event: 'TEST_PASSED',
        defaultBody: `Yth. {{applicant_name}},

Selamat! Anda telah berhasil menyelesaikan tahap Test/Assessment untuk posisi {{job_title}}.

Kami akan menghubungi Anda untuk tahap selanjutnya.

Salam,
Tim HR {{company_name}}`
    },
    'test_reject': {
        subject: 'Update Status Lamaran Anda - {{company_name}}',
        event: 'TEST_REJECTED',
        defaultBody: `Yth. {{applicant_name}},

Terima kasih telah mengikuti Test/Assessment untuk posisi {{job_title}}.

Setelah evaluasi, kami menyesal harus memberitahukan bahwa kami tidak dapat melanjutkan proses rekrutmen Anda.

Salam,
Tim HR {{company_name}}`
    },
    'offering': {
        subject: 'Penawaran Kerja dari {{company_name}}',
        event: 'OFFER_SENT',
        defaultBody: `Yth. {{applicant_name}},

Dengan senang hati kami menginformasikan bahwa Anda telah terpilih untuk posisi {{job_title}} di {{company_name}}!

Kami akan segera mengirimkan detail penawaran kerja kepada Anda.

Selamat dan kami menantikan kehadiran Anda!

Salam,
Tim HR {{company_name}}`
    },
    'hired': {
        subject: 'Selamat Bergabung dengan {{company_name}}!',
        event: 'HIRED',
        defaultBody: `Yth. {{applicant_name}},

Selamat! Anda resmi bergabung sebagai {{job_title}} di {{company_name}}.

Tim kami akan menghubungi Anda untuk proses onboarding.

Selamat datang di keluarga {{company_name}}!

Salam,
Tim HR {{company_name}}`
    },
};

export const getEmailTriggerKey = (status: string, isPass: boolean): string => {
    if (status === 'applied' || status === 'offering' || status === 'hired') {
        return status;
    }
    return `${status}_${isPass ? 'pass' : 'reject'}`;
};

export const replaceEmailVariables = (
    template: string,
    variables: Record<string, string>
): string => {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
};
