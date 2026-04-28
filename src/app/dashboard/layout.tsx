'use client';

import { startTransition, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Briefcase,
    LayoutDashboard,
    Users,
    FileText,
    Kanban,
    Mail,
    Settings,
    LogOut,
    ChevronLeft,
    Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { getCompanySettings, type CompanySettings } from '@/lib/actions/settings';
import { getCurrentUserProfile } from '@/lib/actions/team';
import { signOutUser } from '@/lib/actions/auth';
import Image from 'next/image';

const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Lowongan', href: '/dashboard/jobs', icon: FileText },
    { name: 'Pipeline', href: '/dashboard/pipeline', icon: Kanban },
    { name: 'Kandidat', href: '/dashboard/candidates', icon: Users },
    { name: 'Email Templates', href: '/dashboard/templates', icon: Mail },
    { name: 'Tim & User', href: '/dashboard/team', icon: Users },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [company, setCompany] = useState<CompanySettings | null>(null);
    const [userProfile, setUserProfile] = useState<{role?: string; full_name?: string; avatar_url?: string} | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch Company Settings
                const res = await getCompanySettings();
                if (res.success && res.data) {
                    setCompany(res.data as CompanySettings);
                }

                // Fetch User Profile
                const profile = await getCurrentUserProfile();
                setUserProfile(profile);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            }
        }
        fetchData();
    }, []);

    // Filter Menu Items based on Role
    const filteredItems = sidebarItems.filter(item => {
        if (userProfile?.role === 'recruiter') {
            // Recruiter cannot access Settings, Team, or Templates
            return !['/dashboard/settings', '/dashboard/team', '/dashboard/templates'].includes(item.href);
        }
        return true;
    });

    // Derived values or defaults
    const companyName = company?.name || 'SmartRecruit';
    const primaryColor = company?.primary_color || '#3B82F6';

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-0 left-0 z-40 h-screen bg-slate-900 transition-all duration-300',
                    sidebarOpen ? 'w-64' : 'w-20'
                )}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
                    <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden bg-white"
                        >
                            {company?.logo_url ? (
                                <Image
                                    src={company.logo_url}
                                    alt="Logo"
                                    fill
                                    className="object-contain p-1"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-white" />
                                </div>
                            )}
                        </div>
                        {sidebarOpen && (
                            <span className="text-lg font-bold text-white truncate">{companyName}</span>
                        )}
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-slate-400 hover:text-white hover:bg-slate-800 flex-shrink-0"
                    >
                        <ChevronLeft className={cn('w-5 h-5 transition-transform', !sidebarOpen && 'rotate-180')} />
                    </Button>
                </div>

                {/* Nav Items */}
                <nav className="p-4 space-y-1">
                    {filteredItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href));

                        return (
                            <Link key={item.href} href={item.href}>
                                <div
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group',
                                        isActive
                                            ? 'text-white'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    )}
                                    style={isActive ? { backgroundColor: primaryColor } : undefined}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    {sidebarOpen && <span>{item.name}</span>}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Menu at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className={cn(
                                    'w-full justify-start gap-3 text-slate-300 hover:text-white hover:bg-slate-800',
                                    !sidebarOpen && 'justify-center'
                                )}
                            >
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={userProfile?.avatar_url || ''} />
                                    <AvatarFallback className="text-white text-sm" style={{ backgroundColor: primaryColor }}>
                                        {userProfile?.full_name ? userProfile.full_name.substring(0, 2).toUpperCase() : 'HR'}
                                    </AvatarFallback>
                                </Avatar>
                                {sidebarOpen && (
                                    <div className="text-left overflow-hidden">
                                        <p className="text-sm font-medium truncate">{userProfile?.full_name || 'Loading...'}</p>
                                        <p className="text-xs text-slate-400 truncate">
                                            {userProfile?.role === 'admin' ? 'Administrator' : 'Recruiter Access'}
                                        </p>
                                    </div>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/settings" className="cursor-pointer">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Pengaturan
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600 cursor-pointer"
                                onClick={async () => await signOutUser()}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Keluar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>

            {/* Main Content */}
            <div className={cn(
                'transition-all duration-300',
                sidebarOpen ? 'ml-64' : 'ml-20'
            )}>
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <Menu className="w-5 h-5" />
                    </Button>

                    <div className="flex-1" />

                    <div className="flex items-center gap-4">
                        <Link href="/" target="_blank">
                            <Button variant="outline" size="sm" className="text-slate-600">
                                Lihat Situs Publik
                            </Button>
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
