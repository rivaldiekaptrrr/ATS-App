'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Eye, Mail, Trash2, Loader2, Sparkles, AlertTriangle, Copy } from 'lucide-react';
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { PIPELINE_STAGES } from '@/constants/stages';
import type { ApplicationStatus } from '@/types';
import { toast } from 'sonner';
import { getCandidates, type Candidate } from '@/lib/services/dashboard';
import { getScoreConfig } from '@/lib/services/scoring';
import { findSimilarApplications } from '@/lib/services/dedup';

export default function CandidatesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [duplicateWarnings, setDuplicateWarnings] = useState<Record<string, number>>({});

    useEffect(() => {
        loadCandidates();
    }, []);

    async function loadCandidates() {
        setIsLoading(true);
        try {
            const data = await getCandidates();
            setCandidates(data);

            // Check for duplicate emails
            const emailCounts: Record<string, number> = {};
            data.forEach(c => {
                emailCounts[c.email] = (emailCounts[c.email] || 0) + 1;
            });
            const dupes: Record<string, number> = {};
            Object.entries(emailCounts).forEach(([email, count]) => {
                if (count > 1) dupes[email] = count;
            });
            setDuplicateWarnings(dupes);
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

    // Stats summary
    const scoredCount = candidates.filter(c => c.score !== null && c.score !== undefined).length;
    const avgScore = scoredCount > 0
        ? Math.round(candidates.reduce((sum, c) => sum + (c.score || 0), 0) / scoredCount)
        : 0;
    const duplicateCount = Object.keys(duplicateWarnings).length;

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

            {/* AI Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-slate-200">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">AI Scored</p>
                                <p className="text-xl font-bold text-slate-900">{scoredCount}/{candidates.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Avg. Score</p>
                                <p className="text-xl font-bold text-slate-900">{avgScore}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className={`border-slate-200 ${duplicateCount > 0 ? 'border-amber-300 bg-amber-50/30' : ''}`}>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${duplicateCount > 0 ? 'bg-amber-100' : 'bg-slate-100'}`}>
                                <AlertTriangle className={`w-5 h-5 ${duplicateCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Duplikat Terdeteksi</p>
                                <p className="text-xl font-bold text-slate-900">{duplicateCount} email</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
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
                        <TooltipProvider>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kandidat</TableHead>
                                        <TableHead>ID Tracking</TableHead>
                                        <TableHead>Posisi</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-center">AI Score</TableHead>
                                        <TableHead>Tanggal Melamar</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCandidates.map((candidate) => {
                                        const stage = PIPELINE_STAGES.find(s => s.id === candidate.status);
                                        const isDuplicate = duplicateWarnings[candidate.email];
                                        const scoreConfig = candidate.score != null ? getScoreConfig(candidate.score) : null;

                                        return (
                                            <TableRow key={candidate.id} className={isDuplicate ? 'bg-amber-50/50' : ''}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <span className="text-xs font-medium text-white">
                                                                {candidate.name.split(' ').map(n => n[0]).join('')}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">{candidate.name}</span>
                                                                {isDuplicate && (
                                                                    <Tooltip>
                                                                        <TooltipTrigger>
                                                                            <div className="flex items-center gap-1 text-amber-600">
                                                                                <Copy className="w-3 h-3" />
                                                                                <span className="text-xs font-medium">{isDuplicate}x</span>
                                                                            </div>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>Email ini ditemukan {isDuplicate} kali — kemungkinan duplikat</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                            </div>
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
                                                    {candidate.score !== null && candidate.score !== undefined && scoreConfig ? (
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${scoreConfig.bg} ${scoreConfig.color} ${scoreConfig.border} border`}>
                                                                    <Sparkles className="w-3 h-3" />
                                                                    {candidate.score}
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="font-medium">{scoreConfig.label}</p>
                                                                <p className="text-xs text-slate-400">AI-powered resume score</p>
                                                            </TooltipContent>
                                                        </Tooltip>
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
                        </TooltipProvider>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
