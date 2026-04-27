'use client';

import { useEffect, useState } from 'react';
import { Briefcase, Search, MapPin, Clock, Filter, ChevronDown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { getActiveJobs, type Job } from '@/lib/services/jobs';

const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Gaji Kompetitif';

    const formatNum = (n: number) => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(0)}jt`;
        return n.toLocaleString('id-ID');
    };

    if (min && max) {
        return `Rp ${formatNum(min)} - ${formatNum(max)}`;
    } else if (min) {
        return `Rp ${formatNum(min)}+`;
    } else if (max) {
        return `Hingga Rp ${formatNum(max)}`;
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

    if (diffInDays === 0) return 'Baru';
    if (diffInDays === 1) return '1 hari lalu';
    if (diffInDays < 7) return `${diffInDays} hari lalu`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} minggu lalu`;
    return `${Math.floor(diffInDays / 30)} bulan lalu`;
};

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        loadJobs();
    }, []);

    useEffect(() => {
        filterJobs();
    }, [jobs, searchQuery, locationFilter, typeFilter]);

    const loadJobs = async () => {
        try {
            setIsLoading(true);
            const data = await getActiveJobs();
            setJobs(data);
            setFilteredJobs(data);
        } catch (error) {
            console.error('Error loading jobs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterJobs = () => {
        let filtered = [...jobs];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter((job) =>
                job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Location filter
        if (locationFilter !== 'all') {
            filtered = filtered.filter((job) =>
                job.location.toLowerCase().includes(locationFilter.toLowerCase())
            );
        }

        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter((job) => job.type === typeFilter);
        }

        setFilteredJobs(filtered);
    };

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
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Lowongan Pekerjaan</h1>
                    {isLoading ? (
                        <p className="text-slate-600">Memuat lowongan...</p>
                    ) : (
                        <p className="text-slate-600">
                            Ditemukan {filteredJobs.length} {filteredJobs.length === 1 ? 'lowongan' : 'lowongan'} dari {jobs.length} total lowongan yang tersedia
                        </p>
                    )}
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                placeholder="Cari posisi atau keyword..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={locationFilter} onValueChange={setLocationFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Lokasi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Lokasi</SelectItem>
                                <SelectItem value="jakarta">Jakarta</SelectItem>
                                <SelectItem value="bandung">Bandung</SelectItem>
                                <SelectItem value="surabaya">Surabaya</SelectItem>
                                <SelectItem value="remote">Remote</SelectItem>
                                <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Tipe" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Tipe</SelectItem>
                                <SelectItem value="full-time">Full Time</SelectItem>
                                <SelectItem value="part-time">Part Time</SelectItem>
                                <SelectItem value="contract">Kontrak</SelectItem>
                                <SelectItem value="internship">Magang</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Job Listings */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                        <p className="text-slate-600">Memuat lowongan pekerjaan...</p>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            Tidak ada lowongan ditemukan
                        </h3>
                        <p className="text-slate-600 mb-4">
                            {searchQuery || locationFilter !== 'all' || typeFilter !== 'all'
                                ? 'Coba ubah filter pencarian Anda'
                                : 'Belum ada lowongan yang dipublikasi'}
                        </p>
                        {(searchQuery || locationFilter !== 'all' || typeFilter !== 'all') && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchQuery('');
                                    setLocationFilter('all');
                                    setTypeFilter('all');
                                }}
                            >
                                Reset Filter
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredJobs.map((job) => (
                            <Link key={job.id} href={`/jobs/${job.id}`}>
                                <Card className="group hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 border-slate-200 hover:border-blue-200 cursor-pointer">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between p-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                    {job.title}
                                                </h3>
                                                <Badge className={getJobTypeBadge(job.type)}>
                                                    {getJobTypeLabel(job.type)}
                                                </Badge>
                                            </div>
                                            <p className="text-slate-500 mb-3">{job.department}</p>
                                            <p className="text-slate-600 line-clamp-2 mb-4 md:mb-0">
                                                {job.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-start md:items-end gap-2 md:ml-6">
                                            <span className="font-semibold text-blue-600 text-lg">
                                                {formatSalary(job.salary_min, job.salary_max)}
                                            </span>
                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {job.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {getTimeAgo(job.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
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
