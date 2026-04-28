'use client';

import { useEffect, useState } from 'react';
import {
    Users,
    FileText,
    CheckCircle,
    Clock,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PIPELINE_STAGES } from '@/constants/stages';
import {
    getDashboardStats,
    getPipelineSummary,
    getRecentApplications,
    type DashboardStats,
    type Candidate
} from '@/lib/services/dashboard';

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [pipelineSummary, setPipelineSummary] = useState<{ status: string; count: number }[]>([]);
    const [recentApplications, setRecentApplications] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [statsData, pipelineData, applicationsData] = await Promise.all([
                    getDashboardStats(),
                    getPipelineSummary(),
                    getRecentApplications(),
                ]);

                setStats(statsData);
                setPipelineSummary(pipelineData);
                setRecentApplications(applicationsData);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const statCards = [
        {
            name: 'Total Pelamar',
            value: stats?.totalApplicants.toString() || '0',
            change: '+12%',
            trend: 'up',
            icon: Users,
            color: 'bg-blue-500'
        },
        {
            name: 'Lowongan Aktif',
            value: stats?.activeJobs.toString() || '0',
            change: '+3',
            trend: 'up',
            icon: FileText,
            color: 'bg-indigo-500'
        },
        {
            name: 'Hired Bulan Ini',
            value: stats?.hiredThisMonth.toString() || '0',
            change: '+2',
            trend: 'up',
            icon: CheckCircle,
            color: 'bg-green-500'
        },
        {
            name: 'Avg. Time to Hire',
            value: `${stats?.avgTimeToHire || 0} hari`,
            change: '-3 hari',
            trend: 'down',
            icon: Clock,
            color: 'bg-orange-500'
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-600">Selamat datang kembali! Berikut ringkasan rekrutmen Anda.</p>
                </div>
                <Link href="/dashboard/jobs/new">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        + Buat Lowongan
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <Card key={stat.name} className="border-slate-200">
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">{stat.name}</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 mt-3">
                                {stat.trend === 'up' ? (
                                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                                ) : (
                                    <ArrowDownRight className="w-4 h-4 text-green-600" />
                                )}
                                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                                <span className="text-sm text-slate-500">dari bulan lalu</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Pipeline Summary */}
                <Card className="lg:col-span-2 border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Pipeline Overview</CardTitle>
                            <CardDescription>Distribusi kandidat di setiap tahap</CardDescription>
                        </div>
                        <Link href="/dashboard/pipeline">
                            <Button variant="outline" size="sm">
                                Lihat Pipeline
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {pipelineSummary.map((item) => {
                                const stage = PIPELINE_STAGES.find(s => s.id === item.status);
                                if (!stage) return null;

                                const maxCount = Math.max(...pipelineSummary.map(p => p.count), 1);
                                const percentage = (item.count / maxCount) * 100;

                                return (
                                    <div key={item.status} className="flex items-center gap-4">
                                        <div className="w-28 flex-shrink-0">
                                            <span className="text-sm text-slate-600">{stage.label}</span>
                                        </div>
                                        <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                                            <div
                                                className={`h-full ${stage.bgColor} transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className="w-12 text-right">
                                            <span className="font-semibold text-slate-900">{item.count}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Applications */}
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle>Lamaran Terbaru</CardTitle>
                        <CardDescription>5 lamaran terakhir yang masuk</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentApplications.map((app) => {
                                const stage = PIPELINE_STAGES.find(s => s.id === app.status);

                                return (
                                    <div key={app.id} className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-medium text-slate-600">
                                                {app.name.split(' ').map((n: string) => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 truncate">{app.name}</p>
                                            <p className="text-sm text-slate-500 truncate">{app.position}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <Badge className={`${stage?.bgColor} ${stage?.color} text-xs`}>
                                                {stage?.label}
                                            </Badge>
                                            <p className="text-xs text-slate-400 mt-1">{app.time}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <Link href="/dashboard/candidates">
                            <Button variant="ghost" className="w-full mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                Lihat Semua Kandidat
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle>Aksi Cepat</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link href="/dashboard/jobs/new">
                            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                                <FileText className="w-5 h-5" />
                                <span>Buat Lowongan</span>
                            </Button>
                        </Link>
                        <Link href="/dashboard/pipeline">
                            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                                <TrendingUp className="w-5 h-5" />
                                <span>Kelola Pipeline</span>
                            </Button>
                        </Link>
                        <Link href="/dashboard/candidates">
                            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                                <Users className="w-5 h-5" />
                                <span>Lihat Kandidat</span>
                            </Button>
                        </Link>
                        <Link href="/" target="_blank">
                            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                                <Eye className="w-5 h-5" />
                                <span>Preview Situs</span>
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
