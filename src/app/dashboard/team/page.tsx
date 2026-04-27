'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Mail, Shield, Calendar, Search, UserPlus, Loader2, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getTeamMembers, createUser, type TeamMember } from '@/lib/actions/team';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

export default function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadMembers = useCallback(async () => {
        const result = await getTeamMembers();
        if (result.success && result.data) {
            setMembers(result.data);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadMembers();
    }, [loadMembers]);

    const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);
            const res = await createUser(formData);

            if (res.success) {
                toast.success('Anggota tim berhasil ditambahkan');
                setIsModalOpen(false);
                loadMembers(); // Refresh list
            } else {
                toast.error(res.error || 'Gagal menambahkan anggota');
            }
        } catch (error) {
            console.error(error);
            toast.error('Terjadi kesalahan sistem');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredMembers = members.filter(member =>
        member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tim & Pengguna</h1>
                    <p className="text-slate-600">Kelola akses anggota tim di perusahaan Anda</p>
                </div>
                <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setIsModalOpen(true)}
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Undang Anggota
                </Button>
            </div>

            {/* Filter */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    placeholder="Cari nama atau email..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Team List */}
            <div className="grid gap-4">
                {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                        <Card key={member.id} className="border-slate-200 hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                                        <AvatarImage src={member.avatar_url || ''} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium">
                                            {member.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-slate-900">{member.full_name}</p>
                                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <Mail className="w-3.5 h-3.5" />
                                                {member.email}
                                            </div>
                                            <span className="text-slate-300">•</span>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                Bergabung {format(new Date(member.created_at), 'd MMM yyyy', { locale: idLocale })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className={member.role === 'admin' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200' : ''}>
                                        <Shield className="w-3 h-3 mr-1" />
                                        {member.role === 'admin' ? 'Administrator' : 'Recruiter'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium">Tidak ada anggota ditemukan</p>
                        <p className="text-sm text-slate-500">Coba kata kunci pencarian lain</p>
                    </div>
                )}
            </div>

            <p className="text-center text-xs text-slate-400 mt-8">
                Hanya Administrator yang dapat menambahkan atau menghapus anggota tim.
            </p>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-lg font-semibold">Tambah Anggota Baru</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsModalOpen(false)}
                                className="h-8 w-8 text-slate-500 hover:text-slate-900"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <form onSubmit={handleCreateUser}>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Lengkap</Label>
                                    <Input id="name" name="name" placeholder="John Doe" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" placeholder="john@company.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" name="password" type="password" placeholder="Min. 6 karakter" minLength={6} required />
                                    <p className="text-xs text-slate-500">Password awal untuk login pengguna</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role Akses</Label>
                                    <div className="relative">
                                        <select
                                            id="role"
                                            name="role"
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                            defaultValue="recruiter"
                                        >
                                            <option value="recruiter">Recruiter (Hanya Recruitment)</option>
                                            <option value="admin">Administrator (Akses Penuh)</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Shield className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>
                                    {/* Info Role */}
                                    <div className="bg-slate-50 p-3 rounded-md text-xs text-slate-600 mt-2">
                                        <p className="font-semibold mb-1">Akses Recruiter:</p>
                                        <ul className="list-disc pl-4 space-y-1">
                                            <li>Dashboard & Lowongan</li>
                                            <li>Pipeline & Kandidat</li>
                                            <li>Tidak bisa akses Settings & Tim</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 pt-0 flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        'Buat Akun'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
