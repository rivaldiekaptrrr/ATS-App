import { Briefcase, MapPin, Clock, DollarSign, Users, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/server';
import { getMockJobById } from '@/lib/config';

// Check if using mock data
const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Fetch job from Supabase or Mock
async function getJob(id: string) {
    // Use mock data if configured
    if (useMockData) {
        console.log('[MOCK MODE] Returning mock job:', id);
        return getMockJobById(id);
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('jobs')
        .select('*, companies(name, slug)')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching job:', error);
        return null;
    }

    return data;
}

const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Gaji Kompetitif';

    const format = (n: number) => new Intl.NumberFormat('id-ID').format(n);

    if (min && max) {
        return `Rp ${format(min)} - Rp ${format(max)}`;
    } else if (min) {
        return `Rp ${format(min)}+`;
    } else if (max) {
        return `Hingga Rp ${format(max)}`;
    }
    return 'Gaji Kompetitif';
};

const getJobTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
        'full-time': 'bg-green-100 text-green-800 hover:bg-green-100',
        'part-time': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
        'contract': 'bg-orange-100 text-orange-800 hover:bg-orange-100',
        'internship': 'bg-purple-100 text-purple-800 hover:bg-purple-100',
    };
    return styles[type] || 'bg-gray-100 text-gray-800';
};

const getJobTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
        'full-time': 'Full Time',
        'part-time': 'Part Time',
        'contract': 'Kontrak',
        'internship': 'Magang',
    };
    return labels[type] || type;
};

const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Diposting hari ini';
    if (diffInDays === 1) return 'Diposting kemarin';
    if (diffInDays < 7) return `Diposting ${diffInDays} hari lalu`;
    if (diffInDays < 30) return `Diposting ${Math.floor(diffInDays / 7)} minggu lalu`;
    return `Diposting ${Math.floor(diffInDays / 30)} bulan lalu`;
};

// Parse markdown-like content to list items
const parseContentToList = (content?: string) => {
    if (!content) return [];

    // Remove HTML tags
    const cleaned = content.replace(/<[^>]*>/g, '');

    // Split by newlines and filter empty lines
    return cleaned
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, ''));
};

export default async function JobDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // Fetch job from Supabase
    const job = await getJob(id);

    if (!job) {
        notFound();
    }

    const requirementsList = parseContentToList(job.requirements);
    const benefitsList = parseContentToList(job.benefits);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-slate-200">
                <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            SmartRecruit
                        </span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link href="/track">
                            <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                                Lacak Lamaran
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                                Login HR
                            </Button>
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <Link href="/jobs" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Kembali ke Daftar Lowongan
                </Link>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Job Header */}
                        <Card className="border-slate-200">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <Badge className={`mb-3 ${getJobTypeBadge(job.type)}`}>
                                            {getJobTypeLabel(job.type)}
                                        </Badge>
                                        <CardTitle className="text-2xl md:text-3xl mb-2">{job.title}</CardTitle>
                                        <p className="text-slate-500 text-lg">{job.department}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-4 text-slate-600">
                                    <span className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-slate-400" />
                                        {job.location}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-slate-400" />
                                        {formatSalary(job.salary_min, job.salary_max)}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-slate-400" />
                                        {getTimeAgo(job.created_at)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Description */}
                        <Card className="border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-xl">Deskripsi Pekerjaan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="text-slate-600 whitespace-pre-line leading-relaxed prose prose-slate max-w-none"
                                    dangerouslySetInnerHTML={{
                                        __html: job.description?.replace(/\n/g, '<br />') || 'Tidak ada deskripsi'
                                    }}
                                />
                            </CardContent>
                        </Card>

                        {/* Requirements */}
                        {requirementsList.length > 0 && (
                            <Card className="border-slate-200">
                                <CardHeader>
                                    <CardTitle className="text-xl">Persyaratan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {requirementsList.map((req, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-slate-600">{req}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Benefits */}
                        {benefitsList.length > 0 && (
                            <Card className="border-slate-200">
                                <CardHeader>
                                    <CardTitle className="text-xl">Benefit</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {benefitsList.map((benefit, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-slate-600">{benefit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar - Apply Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <Card className="border-slate-200 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-xl">Tertarik dengan posisi ini?</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-slate-600">
                                        Segera kirimkan lamaran Anda dan jadilah bagian dari tim kami.
                                    </p>

                                    <Link href={`/jobs/${id}/apply`}>
                                        <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 text-lg shadow-lg shadow-blue-500/25">
                                            Lamar Sekarang
                                        </Button>
                                    </Link>

                                    <Separator />

                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Clock className="w-5 h-5 text-slate-400" />
                                            <span>{getTimeAgo(job.created_at)}</span>
                                        </div>
                                        {job.expires_at && (
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <AlertCircle className="w-5 h-5 text-orange-400" />
                                                <span>
                                                    Ditutup pada {new Date(job.expires_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Company Info */}
                            <Card className="border-slate-200 mt-4">
                                <CardHeader>
                                    <CardTitle className="text-lg">Tentang Perusahaan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                            <Briefcase className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">
                                                {job.companies?.name || 'SmartRecruit'}
                                            </h4>
                                            <p className="text-sm text-slate-500">Teknologi</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        Platform teknologi yang membantu perusahaan
                                        mengoptimalkan proses rekrutmen dengan solusi modern dan terintegrasi.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-8 mt-12">
                <div className="container mx-auto px-4 text-center text-sm text-slate-500">
                    © 2026 SmartRecruit ATS. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
