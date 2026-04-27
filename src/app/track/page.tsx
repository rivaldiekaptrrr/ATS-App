'use client';

import { useState } from 'react';
import { Briefcase, Search, Clock, MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PIPELINE_STAGES, getStageByStatus } from '@/constants/stages';
import type { ApplicationStatus } from '@/types';

// Mock application data - will be fetched from Supabase
const mockApplication = {
    tracking_id: 'APP-ABC123',
    status: 'interview_1' as ApplicationStatus,
    job: {
        title: 'Senior Frontend Developer',
        department: 'Engineering',
        company_name: 'SmartRecruit',
    },
    created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-01-08T14:30:00Z',
    history: [
        { status: 'applied', date: '2026-01-05T10:00:00Z', note: 'Lamaran diterima' },
        { status: 'screening', date: '2026-01-06T09:00:00Z', note: 'Sedang ditinjau oleh HR' },
        { status: 'interview_1', date: '2026-01-08T14:30:00Z', note: 'Lolos screening, lanjut ke Interview 1' },
    ],
};

export default function TrackPage() {
    const [trackingId, setTrackingId] = useState('');
    const [email, setEmail] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [application, setApplication] = useState<typeof mockApplication | null>(null);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!trackingId || !email) {
            setError('Masukkan ID Tracking dan Email');
            return;
        }

        setIsSearching(true);
        setError('');

        // TODO: Fetch from Supabase
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock: Only show result if tracking ID contains 'ABC'
        if (trackingId.toUpperCase().includes('ABC')) {
            setApplication(mockApplication);
        } else {
            setError('Lamaran tidak ditemukan. Pastikan ID Tracking dan Email benar.');
        }

        setIsSearching(false);
    };

    const currentStage = application ? getStageByStatus(application.status) : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
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
                        <Link href="/jobs">
                            <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                                Lowongan
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

            <main className="container mx-auto px-4 py-12 max-w-3xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-3">Lacak Lamaran Anda</h1>
                    <p className="text-slate-600">
                        Masukkan ID Tracking dan Email untuk melihat status lamaran
                    </p>
                </div>

                {/* Search Form */}
                <Card className="border-slate-200 shadow-lg mb-8">
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        ID Tracking
                                    </label>
                                    <Input
                                        placeholder="Contoh: APP-ABC123"
                                        value={trackingId}
                                        onChange={(e) => setTrackingId(e.target.value)}
                                        className="uppercase"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Email
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="email@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-600 text-sm">
                                    <XCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <Button
                                onClick={handleSearch}
                                disabled={isSearching}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-5"
                            >
                                {isSearching ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Mencari...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-4 h-4 mr-2" />
                                        Lacak Lamaran
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Result */}
                {application && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Status Card */}
                        <Card className="border-slate-200 shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm mb-1">Lamaran untuk</p>
                                        <h2 className="text-xl font-bold">{application.job.title}</h2>
                                        <p className="text-blue-100">
                                            {application.job.department} • {application.job.company_name}
                                        </p>
                                    </div>
                                    <Badge className="bg-white/20 text-white hover:bg-white/20 text-sm">
                                        {application.tracking_id}
                                    </Badge>
                                </div>
                            </div>

                            <CardContent className="pt-6">
                                {/* Current Status */}
                                <div className="text-center mb-8">
                                    <p className="text-slate-600 mb-2">Status Saat Ini</p>
                                    <Badge className={`${currentStage?.bgColor} ${currentStage?.color} text-lg px-4 py-1`}>
                                        {currentStage?.label}
                                    </Badge>
                                </div>

                                {/* Progress Timeline */}
                                <div className="relative">
                                    <div className="flex justify-between mb-4">
                                        {PIPELINE_STAGES.filter(s => s.order >= 0 && s.order <= 7).map((stage) => {
                                            const isActive = stage.order <= (currentStage?.order ?? 0);
                                            const isCurrent = stage.id === application.status;

                                            return (
                                                <div
                                                    key={stage.id}
                                                    className="flex flex-col items-center flex-1"
                                                >
                                                    <div
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isActive
                                                                ? 'bg-green-500 text-white'
                                                                : 'bg-slate-200 text-slate-400'
                                                            } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}
                                                    >
                                                        {isActive ? (
                                                            <CheckCircle className="w-5 h-5" />
                                                        ) : (
                                                            <span className="text-xs font-medium">{stage.order + 1}</span>
                                                        )}
                                                    </div>
                                                    <span className={`text-xs mt-2 text-center ${isActive ? 'text-slate-900 font-medium' : 'text-slate-400'
                                                        }`}>
                                                        {stage.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Progress Line */}
                                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -z-10">
                                        <div
                                            className="h-full bg-green-500 transition-all"
                                            style={{
                                                width: `${Math.min(100, ((currentStage?.order ?? 0) / 7) * 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* History */}
                        <Card className="border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-lg">Riwayat Aktivitas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {application.history.map((item, index) => {
                                        const stage = getStageByStatus(item.status as ApplicationStatus);
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                                            >
                                                <div className={`w-10 h-10 rounded-full ${stage.bgColor} flex items-center justify-center flex-shrink-0`}>
                                                    <CheckCircle className={`w-5 h-5 ${stage.color}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-slate-900">{stage.label}</span>
                                                        <span className="text-sm text-slate-500">
                                                            {new Date(item.date).toLocaleDateString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 mt-0.5">{item.note}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Info */}
                        <div className="text-center text-sm text-slate-500">
                            <p>
                                Terakhir diperbarui pada{' '}
                                {new Date(application.updated_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>
                )}
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
