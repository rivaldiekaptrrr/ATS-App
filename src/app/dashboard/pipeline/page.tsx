'use client';

import { useState, useEffect } from 'react';
import { User, GripVertical, MoreHorizontal, CheckCircle, XCircle, Eye, Mail, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PIPELINE_STAGES, getStageByStatus, getNextStage } from '@/constants/stages';
import type { ApplicationStatus } from '@/types';
import { toast } from 'sonner';
import { getPipelineCandidates, updateApplicationStatus, type PipelineCandidate } from '@/lib/services/dashboard';

export default function PipelinePage() {
    const [candidates, setCandidates] = useState<PipelineCandidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadCandidates();
    }, []);

    async function loadCandidates() {
        setIsLoading(true);
        try {
            const data = await getPipelineCandidates();
            setCandidates(data);
        } catch (error) {
            console.error('Error loading candidates:', error);
            toast.error('Gagal memuat data kandidat');
        } finally {
            setIsLoading(false);
        }
    }

    const moveCandidate = async (candidateId: string, newStatus: ApplicationStatus) => {
        const success = await updateApplicationStatus(candidateId, newStatus);

        if (success) {
            setCandidates(prev =>
                prev.map(c => c.id === candidateId ? { ...c, status: newStatus } : c)
            );

            const candidate = candidates.find(c => c.id === candidateId);
            const stage = getStageByStatus(newStatus);

            toast.success(`${candidate?.name} dipindahkan ke ${stage.label}`, {
                description: 'Email notifikasi akan dikirim ke kandidat',
            });
        } else {
            toast.error('Gagal memindahkan kandidat');
        }
    };

    const rejectCandidate = async (candidateId: string) => {
        const success = await updateApplicationStatus(candidateId, 'rejected');

        if (success) {
            setCandidates(prev =>
                prev.map(c => c.id === candidateId ? { ...c, status: 'rejected' } : c)
            );

            const candidate = candidates.find(c => c.id === candidateId);
            toast.info(`${candidate?.name} ditolak`, {
                description: 'Email rejection akan dikirim ke kandidat',
            });
        } else {
            toast.error('Gagal menolak kandidat');
        }
    };

    // Only show main pipeline stages (not rejected)
    const pipelineStages = PIPELINE_STAGES.filter(s => s.order >= 0);

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
                <h1 className="text-2xl font-bold text-slate-900">Pipeline Rekrutmen</h1>
                <p className="text-slate-600">Kelola kandidat melalui setiap tahap rekrutmen</p>
            </div>

            {/* Kanban Board */}
            <ScrollArea className="w-full">
                <div className="flex gap-4 pb-4 min-w-max">
                    {pipelineStages.map((stage) => {
                        const stageCandidates = candidates.filter(c => c.status === stage.id);

                        return (
                            <div key={stage.id} className="w-72 flex-shrink-0">
                                <Card className="border-slate-200 bg-slate-50/50">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${stage.bgColor.replace('bg-', 'bg-').replace('-100', '-500')}`} />
                                                <CardTitle className="text-sm font-semibold">{stage.label}</CardTitle>
                                            </div>
                                            <Badge variant="secondary" className="bg-white">
                                                {stageCandidates.length}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 min-h-[400px]">
                                        {stageCandidates.map((candidate) => (
                                            <Card
                                                key={candidate.id}
                                                className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                            >
                                                <CardContent className="p-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <span className="text-xs font-medium text-white">
                                                                {candidate.name.split(' ').map(n => n[0]).join('')}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-slate-900 text-sm truncate">
                                                                {candidate.name}
                                                            </p>
                                                            <p className="text-xs text-slate-500 truncate">
                                                                {candidate.position}
                                                            </p>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 -mr-2 -mt-1">
                                                                    <MoreHorizontal className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem>
                                                                    <Eye className="w-4 h-4 mr-2" />
                                                                    Lihat Detail
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Mail className="w-4 h-4 mr-2" />
                                                                    Kirim Email
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                {stage.id !== 'hired' && (
                                                                    <>
                                                                        {getNextStage(stage.id) && (
                                                                            <DropdownMenuItem
                                                                                className="text-green-600"
                                                                                onClick={() => moveCandidate(candidate.id, getNextStage(stage.id)!)}
                                                                            >
                                                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                                                Lolos ke {getStageByStatus(getNextStage(stage.id)!).label}
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        <DropdownMenuItem
                                                                            className="text-red-600"
                                                                            onClick={() => rejectCandidate(candidate.id)}
                                                                        >
                                                                            <XCircle className="w-4 h-4 mr-2" />
                                                                            Tolak
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}

                                        {stageCandidates.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                                <User className="w-8 h-8 mb-2" />
                                                <p className="text-sm">Belum ada kandidat</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}

                    {/* Rejected Column */}
                    <div className="w-72 flex-shrink-0">
                        <Card className="border-red-200 bg-red-50/50">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <CardTitle className="text-sm font-semibold text-red-700">Rejected</CardTitle>
                                    </div>
                                    <Badge variant="secondary" className="bg-white text-red-600">
                                        {candidates.filter(c => c.status === 'rejected').length}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 min-h-[400px]">
                                {candidates.filter(c => c.status === 'rejected').map((candidate) => (
                                    <Card
                                        key={candidate.id}
                                        className="border-red-200 bg-white/80 shadow-sm"
                                    >
                                        <CardContent className="p-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs font-medium text-red-600">
                                                        {candidate.name.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-slate-700 text-sm truncate">
                                                        {candidate.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 truncate">
                                                        {candidate.position}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
