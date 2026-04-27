import { z } from 'zod';

export const applicationFormSchema = z.object({
    full_name: z.string().min(2, 'Nama minimal 2 karakter'),
    email: z.string().email('Email tidak valid'),
    phone: z.string().min(10, 'Nomor telepon minimal 10 digit').optional().or(z.literal('')),
    address: z.string().optional(),
    bio: z.string().max(500, 'Bio maksimal 500 karakter').optional(),
    linkedin_url: z.string().url('URL LinkedIn tidak valid').optional().or(z.literal('')),
    portfolio_url: z.string().url('URL Portfolio tidak valid').optional().or(z.literal('')),
});

export const workExperienceSchema = z.object({
    company_name: z.string().min(1, 'Nama perusahaan wajib diisi'),
    position: z.string().min(1, 'Posisi wajib diisi'),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    is_current: z.boolean().default(false),
    description: z.string().max(1000, 'Deskripsi maksimal 1000 karakter').optional(),
});

export const educationSchema = z.object({
    institution: z.string().min(1, 'Nama institusi wajib diisi'),
    degree: z.string().optional(),
    field_of_study: z.string().optional(),
    start_year: z.number().min(1950).max(2030).optional(),
    end_year: z.number().min(1950).max(2030).optional(),
    gpa: z.number().min(0).max(4).optional(),
});

export const skillSchema = z.object({
    name: z.string().min(1, 'Nama skill wajib diisi'),
    level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
});

export const fullApplicationSchema = z.object({
    applicant: applicationFormSchema,
    work_experiences: z.array(workExperienceSchema).optional(),
    education: z.array(educationSchema).optional(),
    skills: z.array(skillSchema).optional(),
});

export type ApplicationFormData = z.infer<typeof applicationFormSchema>;
export type WorkExperienceData = z.infer<typeof workExperienceSchema>;
export type EducationData = z.infer<typeof educationSchema>;
export type SkillData = z.infer<typeof skillSchema>;
export type FullApplicationData = z.infer<typeof fullApplicationSchema>;
