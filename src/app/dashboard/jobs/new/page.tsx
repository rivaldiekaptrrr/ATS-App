'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/RichTextEditor';
import { createJobAction } from '@/lib/actions/jobs';

// Form schema
const jobSchema = z.object({
    title: z.string().min(5, 'Judul minimal 5 karakter').max(255, 'Judul maksimal 255 karakter'),
    department: z.string().min(2, 'Departemen minimal 2 karakter').max(100, 'Departemen maksimal 100 karakter'),
    location: z.string().min(2, 'Lokasi minimal 2 karakter').max(255, 'Lokasi maksimal 255 karakter'),
    type: z.enum(['full-time', 'part-time', 'contract', 'internship']),
    salary_min: z.number().min(0, 'Gaji minimal harus lebih dari 0').optional(),
    salary_max: z.number().min(0, 'Gaji maksimal harus lebih dari 0').optional(),
    description: z.string().min(50, 'Deskripsi minimal 50 karakter'),
    requirements: z.string().min(20, 'Requirements minimal 20 karakter'),
    benefits: z.string().optional(),
    expires_at: z.string().optional(),
}).refine((data) => {
    if (data.salary_min && data.salary_max) {
        return data.salary_min < data.salary_max;
    }
    return true;
}, {
    message: 'Gaji minimal harus lebih kecil dari gaji maksimal',
    path: ['salary_max'],
});

type JobFormData = z.infer<typeof jobSchema>;

const JOB_TYPES = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Kontrak' },
    { value: 'internship', label: 'Magang' },
];

const DEPARTMENTS = [
    'Engineering',
    'Product',
    'Design',
    'Marketing',
    'Sales',
    'Human Resources',
    'Finance',
    'Operations',
    'Customer Success',
    'Legal',
];

const LOCATIONS = [
    'Jakarta',
    'Bandung',
    'Surabaya',
    'Yogyakarta',
    'Bali',
    'Semarang',
    'Medan',
    'Remote',
    'Hybrid',
];

export default function NewJobPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [description, setDescription] = useState('');
    const [requirements, setRequirements] = useState('');
    const [benefits, setBenefits] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<JobFormData>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            type: 'full-time',
        },
    });

    const jobType = watch('type');

    const onSubmit = async (data: JobFormData, status: 'draft' | 'active') => {
        setIsSubmitting(true);

        try {
            const jobData = {
                ...data,
                description,
                requirements,
                benefits,
                status,
            };

            // Create job in Supabase
            const res = await createJobAction(jobData);

            if (!res.success) {
                throw new Error(res.error || 'Gagal membuat lowongan');
            }

            toast.success(
                status === 'draft'
                    ? 'Lowongan berhasil disimpan sebagai draft'
                    : 'Lowongan berhasil dipublikasi dan tampil di halaman pelamar!'
            );

            router.push('/dashboard/jobs');
        } catch (error) {
            console.error('Submit Error:', error);
            toast.error(error instanceof Error ? error.message : 'Gagal membuat lowongan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Currency formatter
    const formatCurrency = (value: string) => {
        const number = value.replace(/\D/g, '');
        return new Intl.NumberFormat('id-ID').format(Number(number));
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'salary_min' | 'salary_max') => {
        const value = e.target.value.replace(/\D/g, '');
        setValue(field, Number(value));
    };

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/jobs">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Buat Lowongan Baru</h1>
                    <p className="text-slate-600">Isi informasi lowongan pekerjaan</p>
                </div>
            </div>

            <form className="space-y-6">
                {/* Basic Information */}
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle>Informasi Dasar</CardTitle>
                        <CardDescription>
                            Informasi utama tentang posisi yang dibuka
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title" className="required">
                                Judul Posisi
                            </Label>
                            <Input
                                id="title"
                                placeholder="Contoh: Senior Frontend Developer"
                                {...register('title')}
                                className={errors.title ? 'border-red-500' : ''}
                            />
                            {errors.title && (
                                <p className="text-sm text-red-600">{errors.title.message}</p>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Department */}
                            <div className="space-y-2">
                                <Label htmlFor="department" className="required">
                                    Departemen
                                </Label>
                                <select
                                    id="department"
                                    {...register('department')}
                                    className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                >
                                    <option value="">Pilih Departemen</option>
                                    {DEPARTMENTS.map((dept) => (
                                        <option key={dept} value={dept}>
                                            {dept}
                                        </option>
                                    ))}
                                </select>
                                {errors.department && (
                                    <p className="text-sm text-red-600">{errors.department.message}</p>
                                )}
                            </div>

                            {/* Type */}
                            <div className="space-y-2">
                                <Label htmlFor="type" className="required">
                                    Tipe Pekerjaan
                                </Label>
                                <select
                                    id="type"
                                    {...register('type')}
                                    className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                >
                                    {JOB_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.type && (
                                    <p className="text-sm text-red-600">{errors.type.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <Label htmlFor="location" className="required">
                                Lokasi
                            </Label>
                            <select
                                id="location"
                                {...register('location')}
                                className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            >
                                <option value="">Pilih Lokasi</option>
                                {LOCATIONS.map((loc) => (
                                    <option key={loc} value={loc}>
                                        {loc}
                                    </option>
                                ))}
                            </select>
                            {errors.location && (
                                <p className="text-sm text-red-600">{errors.location.message}</p>
                            )}
                        </div>

                        {/* Salary Range */}
                        <div className="space-y-2">
                            <Label>Rentang Gaji (Opsional)</Label>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="salary_min" className="text-sm text-slate-600">
                                        Gaji Minimal
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                            Rp
                                        </span>
                                        <Input
                                            id="salary_min"
                                            placeholder="0"
                                            {...register('salary_min', {
                                                setValueAs: (v) => (v === '' ? undefined : Number(v)),
                                            })}
                                            onChange={(e) => {
                                                const formatted = formatCurrency(e.target.value);
                                                e.target.value = formatted;
                                                handleCurrencyChange(e, 'salary_min');
                                            }}
                                            className="pl-10"
                                        />
                                    </div>
                                    {errors.salary_min && (
                                        <p className="text-sm text-red-600">{errors.salary_min.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="salary_max" className="text-sm text-slate-600">
                                        Gaji Maksimal
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                            Rp
                                        </span>
                                        <Input
                                            id="salary_max"
                                            placeholder="0"
                                            {...register('salary_max', {
                                                setValueAs: (v) => (v === '' ? undefined : Number(v)),
                                            })}
                                            onChange={(e) => {
                                                const formatted = formatCurrency(e.target.value);
                                                e.target.value = formatted;
                                                handleCurrencyChange(e, 'salary_max');
                                            }}
                                            className="pl-10"
                                        />
                                    </div>
                                    {errors.salary_max && (
                                        <p className="text-sm text-red-600">{errors.salary_max.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Expires At */}
                        <div className="space-y-2">
                            <Label htmlFor="expires_at">Tanggal Kadaluarsa (Opsional)</Label>
                            <Input
                                id="expires_at"
                                type="date"
                                {...register('expires_at')}
                                min={new Date().toISOString().split('T')[0]}
                            />
                            <p className="text-xs text-slate-500">
                                Lowongan akan otomatis ditutup setelah tanggal ini
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Job Details */}
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle>Detail Pekerjaan</CardTitle>
                        <CardDescription>
                            Deskripsi lengkap tentang pekerjaan dan requirements
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="required">
                                Deskripsi Pekerjaan
                            </Label>
                            <RichTextEditor
                                value={description}
                                onChange={(value: string) => {
                                    setDescription(value);
                                    setValue('description', value);
                                }}
                                placeholder="Jelaskan tentang posisi ini, tanggung jawab, dan ekspektasi..."
                            />
                            {errors.description && (
                                <p className="text-sm text-red-600">{errors.description.message}</p>
                            )}
                        </div>

                        {/* Requirements */}
                        <div className="space-y-2">
                            <Label htmlFor="requirements" className="required">
                                Kualifikasi & Requirements
                            </Label>
                            <RichTextEditor
                                value={requirements}
                                onChange={(value: string) => {
                                    setRequirements(value);
                                    setValue('requirements', value);
                                }}
                                placeholder="Tuliskan kualifikasi yang dibutuhkan..."
                            />
                            {errors.requirements && (
                                <p className="text-sm text-red-600">{errors.requirements.message}</p>
                            )}
                        </div>

                        {/* Benefits */}
                        <div className="space-y-2">
                            <Label htmlFor="benefits">Benefits (Opsional)</Label>
                            <RichTextEditor
                                value={benefits}
                                onChange={(value: string) => {
                                    setBenefits(value);
                                    setValue('benefits', value);
                                }}
                                placeholder="Tuliskan benefit yang ditawarkan..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200 sticky bottom-0 bg-white py-4 -mx-6 px-6">
                    <Link href="/dashboard/jobs">
                        <Button type="button" variant="outline">
                            Batal
                        </Button>
                    </Link>
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleSubmit((data) => onSubmit(data, 'draft'))}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Simpan Draft
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit((data) => onSubmit(data, 'active'))}
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Mempublikasi...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Publikasi Lowongan
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
