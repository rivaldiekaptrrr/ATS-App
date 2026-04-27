import { z } from 'zod';

export const jobFormSchema = z.object({
    title: z.string().min(3, 'Judul posisi minimal 3 karakter'),
    department: z.string().optional(),
    location: z.string().optional(),
    type: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
    salary_min: z.number().min(0).optional(),
    salary_max: z.number().min(0).optional(),
    description: z.string().min(50, 'Deskripsi minimal 50 karakter'),
    requirements: z.string().optional(),
    benefits: z.string().optional(),
    status: z.enum(['draft', 'active', 'closed']).default('draft'),
    expires_at: z.string().optional(),
}).refine(
    (data) => {
        if (data.salary_min && data.salary_max) {
            return data.salary_min <= data.salary_max;
        }
        return true;
    },
    {
        message: 'Gaji minimum harus lebih kecil dari gaji maksimum',
        path: ['salary_min'],
    }
);

export type JobFormData = z.infer<typeof jobFormSchema>;
