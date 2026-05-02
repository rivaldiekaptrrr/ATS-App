'use client';

import { useState, useEffect, useRef } from 'react';
import { Briefcase, ArrowLeft, Upload, FileText, CheckCircle, Loader2, Sparkles, Wand2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicationFormSchema, type ApplicationFormData } from '@/lib/validations';
import { toast } from 'sonner';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { createClient } from '@/lib/supabase/client';
import { appConfig, getMockJobById } from '@/lib/config';
import { checkDuplicateApplicant } from '@/lib/services/dedup';

interface Job {
    id: string;
    title: string;
    department: string;
    companies?: {
        name: string;
    };
}

export default function ApplyPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [job, setJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
    const [parsedSkills, setParsedSkills] = useState<string[]>([]);

    // Parsing State
    const [isParsing, setIsParsing] = useState(false);
    const [parseStatus, setParseStatus] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<ApplicationFormData>({
        resolver: zodResolver(applicationFormSchema),
        defaultValues: {
            full_name: '',
            email: '',
            phone: '',
            address: '',
            bio: '',
            linkedin_url: '',
            portfolio_url: '',
        },
    });

    // Watch email for duplicate detection
    const emailValue = form.watch('email');

    useEffect(() => {
        const checkDuplicate = async () => {
            if (emailValue && emailValue.includes('@')) {
                const result = await checkDuplicateApplicant(emailValue, id);
                if (result.isDuplicate && result.message) {
                    setDuplicateWarning(result.message);
                } else {
                    setDuplicateWarning(null);
                }
            } else {
                setDuplicateWarning(null);
            }
        };

        const timeoutId = setTimeout(checkDuplicate, 500); // debounce
        return () => clearTimeout(timeoutId);
    }, [emailValue, id]);

    // Fetch job data on mount
    useEffect(() => {
        async function fetchJob() {
            if (appConfig.useMockData) {
                const mockJob = getMockJobById(id);
                if (mockJob) {
                    setJob({
                        id: mockJob.id,
                        title: mockJob.title,
                        department: mockJob.department,
                        companies: mockJob.companies,
                    });
                }
                setIsLoading(false);
                return;
            }

            const supabase = createClient();
            const { data, error } = await supabase
                .from('jobs')
                .select('id, title, department, companies(name)')
                .eq('id', id)
                .single();

            if (error || !data) {
                toast.error('Lowongan tidak ditemukan');
                router.push('/jobs');
                return;
            }

            // Handle companies relation
            const companiesData = data.companies as { name: string } | { name: string }[] | null;
            const companyName = Array.isArray(companiesData)
                ? companiesData[0]?.name
                : companiesData?.name;

            setJob({
                id: data.id,
                title: data.title,
                department: data.department,
                companies: companyName ? { name: companyName } : undefined,
            });
            setIsLoading(false);
        }

        fetchJob();
    }, [id, router]);

    // Handle File Upload & Parsing
    const handleFileSelect = async (file: File) => {
        if (!file) return;

        // Validate type
        if (file.type !== 'application/pdf') {
            toast.error('Saat ini Auto-Fill hanya mendukung file PDF');
            setSelectedFile(file);
            return;
        }

        setSelectedFile(file);
        setIsParsing(true);
        setParseStatus('Membaca dokumen...');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('jobId', id);

        try {
            const response = await fetch('/api/parse-cv', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                // Handle cases where the server returns a 500 HTML error page (like Turbopack compilation errors)
                const text = await response.text();
                let errorMessage = 'Gagal memproses CV dari server.';
                try {
                    const errObj = JSON.parse(text);
                    errorMessage = errObj.error || errorMessage;
                } catch {
                    console.error('Server returned non-JSON error:', text.substring(0, 500));
                    if (text.includes('pdf-parse')) {
                         errorMessage = 'Server gagal memuat library pembaca PDF. Harap restart server.';
                    }
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Gagal memproses CV');
            }

            setParseStatus('Mengisi formulir...');
            const data = result.data;
            
            if (data.full_name) form.setValue('full_name', data.full_name);
            if (data.email) form.setValue('email', data.email);
            if (data.phone) form.setValue('phone', data.phone);
            if (data.summary) form.setValue('bio', data.summary);
            if (data.skills) setParsedSkills(data.skills);

            if (result.engine_used === 'ai') {
                toast.success('✨ CV berhasil dianalisis menggunakan AI!');
            } else {
                toast.success('CV berhasil dibaca.');
            }

        } catch (error) {
            console.error('Parsing error:', error);
            toast.error('Gagal membaca otomatis CV. Silakan isi form manual.');
        } finally {
            setIsParsing(false);
            setParseStatus('');
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    // Submit Logic
    const onSubmit = async (data: ApplicationFormData) => {
        if (duplicateWarning) {
            toast.error('Anda sudah melamar posisi ini sebelumnya.');
            return;
        }

        setIsSubmitting(true);
        try {
            if (appConfig.useMockData) {
                // Calculate real AI score even in mock mode if skills are available
                const mockScore = parsedSkills.length > 0 ? Math.min(100, (parsedSkills.length / 5) * 100) : 70;
                
                const { addMockApplication } = await import('@/lib/services/dashboard');
                addMockApplication({
                    id: `mock-${Date.now()}`,
                    tracking_id: `MOCK-${Date.now()}`,
                    name: data.full_name,
                    email: data.email,
                    phone: data.phone,
                    position: job.title,
                    status: 'applied',
                    score: Math.round(mockScore),
                    applied_at: new Date().toISOString()
                });

                await new Promise(r => setTimeout(r, 1500));
                toast.success('MOCK: Lamaran berhasil dikirim!');
                router.push(`/apply/success?tracking_id=MOCK-${Date.now()}`); 
                return;
            }

            const supabase = createClient();

            let cvUrl = null;
            let cvFilename = null;

            if (selectedFile) {
                const fileName = `${Date.now()}-${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('cv-files')
                    .upload(fileName, selectedFile);

                if (uploadError) throw new Error('Gagal upload file CV: ' + uploadError.message);

                const { data: { publicUrl } } = supabase.storage
                    .from('cv-files')
                    .getPublicUrl(uploadData.path);

                cvUrl = publicUrl;
                cvFilename = selectedFile.name;
            }

            const { data: applicant, error: applicantError } = await supabase
                .from('applicants')
                .insert([{
                    full_name: data.full_name,
                    email: data.email,
                    phone: data.phone || null,
                    address: data.address || null,
                    bio: data.bio || null,
                    linkedin_url: data.linkedin_url || null,
                    portfolio_url: data.portfolio_url || null,
                    cv_url: cvUrl,
                    cv_filename: cvFilename
                }])
                .select()
                .single();

            if (applicantError) throw applicantError;

            const { data: jobData } = await supabase
                .from('jobs')
                .select('company_id')
                .eq('id', id)
                .single();

            const { data: application, error: applicationError } = await supabase
                .from('applications')
                .insert([{
                    applicant_id: applicant.id,
                    job_id: id,
                    company_id: jobData?.company_id,
                    status: 'applied',
                }])
                .select('tracking_id')
                .single();

            if (applicationError) throw applicationError;

            toast.success('Lamaran terkirim!');
            router.push(`/apply/success?tracking_id=${application.tracking_id}`);

        } catch (error) {
            console.error('Submit Error:', error);
            toast.error(error instanceof Error ? error.message : 'Gagal mengirim lamaran');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!job) return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
                <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-xl font-bold text-slate-900">SmartRecruit</span>
                    </Link>
                </nav>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <Link href={`/jobs/${id}`} className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                </Link>

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Lamar Posisi: {job.title}</h1>
                    <p className="text-slate-600">{job.department}</p>
                </div>

                {/* Smart Upload Area */}
                <Card className="border-blue-200 bg-blue-50/50 mb-8 overflow-hidden">
                    <CardContent className="p-0">
                        <div
                            className={`p-8 text-center transition-all cursor-pointer border-2 border-dashed ${dragActive ? 'border-blue-500 bg-blue-100' : 'border-blue-300 hover:border-blue-400'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {isParsing ? (
                                <div className="py-4">
                                    <div className="relative w-16 h-16 mx-auto mb-4">
                                        <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                                        <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-blue-600 animate-pulse" />
                                    </div>
                                    <p className="font-semibold text-blue-900">{parseStatus}</p>
                                    <p className="text-sm text-blue-600">AI sedang mengekstrak data dari CV Anda...</p>
                                </div>
                            ) : selectedFile ? (
                                <div className="py-2">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                    <p className="font-medium text-slate-900">{selectedFile.name}</p>
                                    <p className="text-sm text-slate-500 mb-4">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}>
                                        Ganti File
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                                        <Wand2 className="w-7 h-7 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                        Auto-Fill with AI
                                    </h3>
                                    <p className="text-blue-700 mb-6 max-w-sm mx-auto">
                                        Drop CV Anda di sini (PDF). Sistem kami akan otomatis mengisi formulir untuk Anda.
                                    </p>
                                    <div className="inline-block">
                                        <Button
                                            size="lg"
                                            className="bg-blue-600 hover:bg-blue-700"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload CV
                                        </Button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Main Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Data Pelamar</CardTitle>
                        <CardDescription>Silakan lengkapi atau koreksi data di bawah ini</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {duplicateWarning && (
                            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-900">Perhatian</p>
                                    <p className="text-sm text-amber-700 mt-1">{duplicateWarning}</p>
                                </div>
                            </div>
                        )}

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="full_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nama Lengkap</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nama sesuai KTP" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="email@contoh.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>WhatsApp / HP</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="08..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="linkedin_url"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>LinkedIn (Opsional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="linkedin.com/in/..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="bio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ringkasan Profil</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Ceritakan singkat tentang pengalaman Anda..."
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full text-lg mt-4"
                                    disabled={isSubmitting || !!duplicateWarning}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Mengirim...
                                        </>
                                    ) : (
                                        'Kirim Lamaran Sekarang'
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
