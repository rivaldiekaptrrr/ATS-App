'use client';

import { useState } from 'react';
import { Briefcase, Mail, Lock, Loader2, Building2, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { signUpUser } from '@/lib/actions/auth';

export default function SignUpPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            const result = await signUpUser(formData);

            if (result.error) {
                toast.error(result.error);
            } else if (result.success) {
                toast.success('Pendaftaran berhasil! Mengalihkan...');
                router.push('/dashboard/settings'); // Go to settings first to setup profile
            }
        } catch (error) {
            toast.error('Terjadi kesalahan sistem.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-lg border-slate-700 bg-white/10 backdrop-blur-xl shadow-2xl">
                <CardHeader className="text-center pb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
                        <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-white">Mulai Rekrutmen Cerdas</CardTitle>
                    <CardDescription className="text-slate-300">
                        Buat akun perusahaan Anda dalam 30 detik.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-200">Nama Anda</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Budi Santoso"
                                        required
                                        className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="companyName" className="text-slate-200">Perusahaan</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="companyName"
                                        name="companyName"
                                        placeholder="Tech Corp"
                                        required
                                        className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-200">Email Kerja</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="hr@company.com"
                                    required
                                    className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-200">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Minimal 6 karakter"
                                    required
                                    minLength={6}
                                    className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    Daftar Sekarang <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-sm">
                            Sudah punya akun?{' '}
                            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium hover:underline">
                                Masuk di sini
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
