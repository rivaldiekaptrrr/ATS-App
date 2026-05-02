'use client';

import { CheckCircle, Briefcase, Copy, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import * as React from 'react';
import { toast } from 'sonner';

export default function ApplySuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ tracking_id?: string }>;
}) {
    const { tracking_id } = React.use(searchParams);
    const trackingId = tracking_id || 'APP-XXXXXX';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 flex flex-col">
            {/* Header */}
            <header className="backdrop-blur-lg bg-white/80 border-b border-slate-200">
                <nav className="container mx-auto px-4 py-4">
                    <Link href="/" className="flex items-center gap-2 w-fit">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            SmartRecruit
                        </span>
                    </Link>
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-lg w-full text-center">
                    <div className="mb-8">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-3">
                            Lamaran Berhasil Dikirim!
                        </h1>
                        <p className="text-slate-600">
                            Terima kasih telah melamar. Kami akan meninjau lamaran Anda dan
                            menghubungi Anda melalui email.
                        </p>
                    </div>

                    {/* Tracking ID Card */}
                    <Card className="border-slate-200 shadow-lg mb-8">
                        <CardContent className="py-6">
                            <p className="text-slate-600 mb-2">ID Tracking Lamaran Anda</p>
                            <div className="flex items-center justify-center gap-3">
                                <code className="text-2xl font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                                    {trackingId}
                                </code>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10"
                                    onClick={() => {
                                        navigator.clipboard.writeText(trackingId);
                                        toast.success('ID Tracking berhasil disalin!');
                                    }}
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-sm text-slate-500 mt-3">
                                Simpan ID ini untuk melacak status lamaran Anda
                            </p>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/track">
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25">
                                Lacak Status Lamaran
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                        <Link href="/jobs">
                            <Button variant="outline" className="border-slate-300">
                                Lihat Lowongan Lain
                            </Button>
                        </Link>
                    </div>

                    {/* Info Links */}
                    <div className="mt-12 pt-8 border-t border-slate-200">
                        <h3 className="font-semibold text-slate-900 mb-3">Apa selanjutnya?</h3>
                        <div className="space-y-2 text-sm text-slate-600">
                            <p>✓ Anda akan menerima email konfirmasi</p>
                            <p>✓ Tim HR akan meninjau lamaran Anda</p>
                            <p>✓ Anda akan mendapat update di setiap tahap rekrutmen</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-6">
                <div className="container mx-auto px-4 text-center text-sm text-slate-500">
                    © 2026 SmartRecruit ATS. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
