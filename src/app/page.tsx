import { Briefcase, Search, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { mockJobs } from '@/lib/config';

// Check if using mock data
const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Fetch jobs from Supabase (Server Component)
async function getLatestJobs() {
  // Use mock data if configured
  if (useMockData) {
    console.log('[MOCK MODE] Returning mock jobs for homepage');
    return mockJobs.filter(job => job.status === 'active').slice(0, 4);
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(4);

  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }

  return data || [];
}

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

import { createServiceClient } from '@/lib/supabase/server';
import Image from 'next/image';

// Fetch Company Info (Single Tenant: Get the first company found)
async function getCompanyInfo() {
  const serviceClient = await createServiceClient();
  const { data: company, error } = await serviceClient
    .from('companies')
    .select('*')
    .single(); // For Single Tenant, we just take the one and only company

  if (error || !company) {
    return {
      name: 'SmartRecruit',
      logo_url: null,
      primary_color: '#3B82F6'
    };
  }
  return company;
}

export default async function HomePage() {
  const jobs = await getLatestJobs();
  const company = await getCompanyInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-slate-200">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden bg-white shadow-sm border border-slate-100">
              {company.logo_url ? (
                <Image
                  src={company.logo_url}
                  alt="Logo"
                  fill
                  className="object-contain p-1"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {company.name}
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/track">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                Lacak Lamaran
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25">
                Login HR
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent opacity-50" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100 px-4 py-1.5 text-sm font-medium">
              🚀 Platform Rekrutmen Modern
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Temukan{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Karir Impian
              </span>{' '}
              Anda
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              Jelajahi berbagai peluang karir menarik dari perusahaan terpercaya.
              Proses rekrutmen transparan dengan update status real-time.
            </p>

            {/* Search Box */}
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-2 flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Cari posisi, skill, atau perusahaan..."
                  className="pl-12 h-14 border-0 text-lg focus-visible:ring-0"
                />
              </div>
              <Link href="/jobs">
                <Button className="h-14 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25">
                  <Search className="w-5 h-5 mr-2" />
                  Cari
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">{jobs.length > 0 ? `${jobs.length}+` : '0'}</div>
                <div className="text-sm text-slate-500">Lowongan Aktif</div>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">1</div>
                <div className="text-sm text-slate-500">Perusahaan</div>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">--</div>
                <div className="text-sm text-slate-500">Kandidat</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Lowongan Terbaru</h2>
              <p className="text-slate-600 mt-2">
                {jobs.length > 0
                  ? 'Temukan posisi yang sesuai dengan keahlian Anda'
                  : 'Belum ada lowongan yang tersedia saat ini'}
              </p>
            </div>
            <Link href="/jobs">
              <Button variant="outline" className="border-slate-300 hover:bg-slate-50">
                Lihat Semua
              </Button>
            </Link>
          </div>

          {jobs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <Card className="group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border-slate-200 hover:border-blue-200 cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </CardTitle>
                          <p className="text-slate-500 mt-1">{job.department}</p>
                        </div>
                        <Badge className={getJobTypeBadge(job.type)}>
                          {getJobTypeLabel(job.type)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 line-clamp-2">
                        {job.description?.replace(/<[^>]*>/g, '').substring(0, 120) || 'Tidak ada deskripsi'}...
                      </p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {getTimeAgo(job.created_at)}
                        </span>
                      </div>
                      <span className="font-semibold text-blue-600">
                        {formatSalary(job.salary_min, job.salary_max)}
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Belum Ada Lowongan
              </h3>
              <p className="text-slate-600 mb-4">
                HR belum mempublikasikan lowongan apa pun. <br />
                Cek kembali nanti atau hubungi HR.
              </p>
              <Link href="/login">
                <Button variant="outline">
                  Login sebagai HR
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Proses Rekrutmen Transparan</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Dapatkan update status lamaran Anda secara real-time melalui email
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Apply Online',
                desc: 'Upload CV atau isi form manual dengan mudah',
              },
              {
                step: '02',
                title: 'Lacak Status',
                desc: 'Pantau progres lamaran Anda kapanpun',
              },
              {
                step: '03',
                title: 'Notifikasi Email',
                desc: 'Terima update otomatis di setiap tahapan',
              },
            ].map((feature) => (
              <div key={feature.step} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white group-hover:scale-110 transition-transform">
                  {feature.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-12 shadow-2xl shadow-blue-500/25">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Siap Memulai Karir Baru?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Jelajahi lowongan pekerjaan dan temukan posisi yang tepat untuk Anda
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/jobs">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg">
                  Lihat Lowongan
                </Button>
              </Link>
              <Link href="/track">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold">
                  Lacak Lamaran
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900">SmartRecruit</span>
            </div>
            <p className="text-slate-500 text-sm">
              © 2026 SmartRecruit ATS. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="#" className="hover:text-slate-900 transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">Terms</Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
