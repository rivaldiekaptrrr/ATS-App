'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, MoreHorizontal, Edit, Eye, Trash2, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { getDashboardJobs, type DashboardJob } from '@/lib/services/dashboard';
import { deleteJob, updateJobStatus } from '@/lib/services/jobs';

type JobStatus = 'draft' | 'active' | 'closed';

const getStatusBadge = (status: JobStatus) => {
    const styles: Record<JobStatus, string> = {
        'active': 'bg-green-100 text-green-800 hover:bg-green-100',
        'draft': 'bg-slate-100 text-slate-800 hover:bg-slate-100',
        'closed': 'bg-red-100 text-red-800 hover:bg-red-100',
    };
    const labels: Record<JobStatus, string> = {
        'active': 'Aktif',
        'draft': 'Draft',
        'closed': 'Ditutup',
    };

    return <Badge className={styles[status]}>{labels[status]}</Badge>;
};

export default function JobsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [jobs, setJobs] = useState<DashboardJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadJobs();
    }, []);

    async function loadJobs() {
        setIsLoading(true);
        try {
            const data = await getDashboardJobs();
            setJobs(data);
        } catch (error) {
            console.error('Error loading jobs:', error);
            toast.error('Gagal memuat data lowongan');
        } finally {
            setIsLoading(false);
        }
    }

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDuplicate = (job: DashboardJob) => {
        const newJob = {
            ...job,
            id: String(Date.now()),
            title: `${job.title} (Copy)`,
            status: 'draft' as JobStatus,
            applicants: 0,
            created_at: new Date().toISOString().split('T')[0],
        };
        setJobs([newJob, ...jobs]);
        toast.success(`Lowongan "${job.title}" berhasil diduplikasi`);
    };

    const handleDelete = async (job: DashboardJob) => {
        try {
            await deleteJob(job.id);
            setJobs(jobs.filter(j => j.id !== job.id));
            toast.success(`Lowongan "${job.title}" berhasil dihapus`);
        } catch (error) {
            toast.error('Gagal menghapus lowongan');
        }
    };

    const handleStatusChange = async (job: DashboardJob, newStatus: JobStatus) => {
        try {
            await updateJobStatus(job.id, newStatus);
            setJobs(jobs.map(j =>
                j.id === job.id ? { ...j, status: newStatus } : j
            ));
            toast.success(`Status lowongan berhasil diubah ke ${newStatus}`);
        } catch (error) {
            toast.error('Gagal mengubah status lowongan');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Lowongan</h1>
                    <p className="text-slate-600">Kelola semua lowongan pekerjaan</p>
                </div>
                <Link href="/dashboard/jobs/new">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Buat Lowongan
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card className="border-slate-200">
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            placeholder="Cari lowongan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Jobs Table */}
            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle>Semua Lowongan</CardTitle>
                    <CardDescription>{filteredJobs.length} lowongan ditemukan</CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredJobs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-slate-500 mb-4">Belum ada lowongan</p>
                            <Link href="/dashboard/jobs/new">
                                <Button>Buat Lowongan Pertama</Button>
                            </Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Posisi</TableHead>
                                    <TableHead>Departemen</TableHead>
                                    <TableHead>Lokasi</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">Pelamar</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredJobs.map((job) => (
                                    <TableRow key={job.id}>
                                        <TableCell>
                                            <div className="font-medium">{job.title}</div>
                                            <div className="text-sm text-slate-500">{job.type}</div>
                                        </TableCell>
                                        <TableCell>{job.department}</TableCell>
                                        <TableCell>{job.location}</TableCell>
                                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                                        <TableCell className="text-center">
                                            <span className="font-semibold">{job.applicants}</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/jobs/${job.id}`} target="_blank">
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Lihat
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/jobs/${job.id}/edit`}>
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDuplicate(job)}>
                                                        <Copy className="w-4 h-4 mr-2" />
                                                        Duplikasi
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {job.status === 'draft' && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleStatusChange(job, 'active')}
                                                            className="text-green-600"
                                                        >
                                                            Publikasikan
                                                        </DropdownMenuItem>
                                                    )}
                                                    {job.status === 'active' && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleStatusChange(job, 'closed')}
                                                            className="text-orange-600"
                                                        >
                                                            Tutup Lowongan
                                                        </DropdownMenuItem>
                                                    )}
                                                    {job.status === 'closed' && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleStatusChange(job, 'active')}
                                                            className="text-green-600"
                                                        >
                                                            Buka Kembali
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(job)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
