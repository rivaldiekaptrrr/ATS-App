'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Eye, Mail, Trash2, Loader2 } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PIPELINE_STAGES } from '@/constants/stages';
import type { ApplicationStatus } from '@/types';
import { toast } from 'sonner';
import { getCandidates, type Candidate } from '@/lib/services/dashboard';

export default function CandidatesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadCandidates();
    }, []);

    async function loadCandidates() {
        setIsLoading(true);
        try {
            const data = await getCandidates();
            setCandidates(data);
        } catch (error) {
            console.error('Error loading candidates:', error);
            toast.error('Gagal memuat data kandidat');
        } finally {
            setIsLoading(false);
        }
    }

    const filteredCandidates = candidates.filter(candidate => {
        const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            candidate.tracking_id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

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
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Kandidat</h1>
                <p className="text-slate-600">Kelola semua kandidat yang melamar</p>
            </div>

            {/* Filters */}
            <Card className="border-slate-200">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                placeholder="Cari nama, email, atau ID tracking..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-48">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                {PIPELINE_STAGES.map((stage) => (
                                    <SelectItem key={stage.id} value={stage.id}>
                                        {stage.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Candidates Table */}
            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle>Daftar Kandidat</CardTitle>
                    <CardDescription>{filteredCandidates.length} kandidat ditemukan</CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredCandidates.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-slate-500">Belum ada kandidat yang melamar</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kandidat</TableHead>
                                    <TableHead>ID Tracking</TableHead>
                                    <TableHead>Posisi</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">Skor</TableHead>
                                    <TableHead>Tanggal Melamar</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCandidates.map((candidate) => {
                                    const stage = PIPELINE_STAGES.find(s => s.id === candidate.status);

                                    return (
                                        <TableRow key={candidate.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs font-medium text-white">
                                                            {candidate.name.split(' ').map(n => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{candidate.name}</div>
                                                        <div className="text-sm text-slate-500">{candidate.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                                                    {candidate.tracking_id}
                                                </code>
                                            </TableCell>
                                            <TableCell>{candidate.position}</TableCell>
                                            <TableCell>
                                                <Badge className={`${stage?.bgColor} ${stage?.color}`}>
                                                    {stage?.label || candidate.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {candidate.score !== null && candidate.score !== undefined ? (
                                                    <span className={`font-semibold ${candidate.score >= 80 ? 'text-green-600' :
                                                            candidate.score >= 60 ? 'text-yellow-600' :
                                                                'text-red-600'
                                                        }`}>
                                                        {candidate.score}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(candidate.applied_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Lihat Detail
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Mail className="w-4 h-4 mr-2" />
                                                            Kirim Email
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600">
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Hapus
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
