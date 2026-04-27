'use client';

import { useState } from 'react';
import { Briefcase, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Email dan password wajib diisi');
            return;
        }

        setIsLoading(true);

        try {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast.error('Login gagal: ' + error.message);
            } else {
                toast.success('Login berhasil!');
                router.push('/dashboard/settings'); // Go to settings to confirm profile load
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            toast.error('Terjadi kesalahan sistem');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col">
            {/* Back to Home */}
            <div className="container mx-auto px-4 py-4">
                <Link href="/" className="inline-flex items-center text-white/70 hover:text-white transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Kembali ke Beranda
                </Link>
            </div>

            {/* Login Form */}
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-slate-700 bg-white/10 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="text-center pb-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
                            <Briefcase className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl text-white">Selamat Datang</CardTitle>
                        <CardDescription className="text-slate-300">
                            Masuk ke HR Dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-200">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="hr@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-200">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 text-slate-300">
                                    <input type="checkbox" className="rounded border-slate-500" />
                                    Ingat saya
                                </label>
                                <Link href="#" className="text-blue-400 hover:text-blue-300">
                                    Lupa password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-5 shadow-lg shadow-blue-500/25"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Masuk...
                                    </>
                                ) : (
                                    'Masuk'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-slate-400">
                            <p>Belum punya akun?</p>
                            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium hover:underline mt-1 inline-block">
                                Daftar Perusahaan Baru
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Footer */}
            <div className="text-center py-6 text-sm text-slate-400">
                © 2026 SmartRecruit ATS. All rights reserved.
            </div>
        </div>
    );
}
