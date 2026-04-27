// ============================================
// APP CONFIGURATION
// ============================================
// Central configuration for the ATS application
// Use environment variables to control behavior

export const appConfig = {
    // Feature Flags
    useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true',

    // App Info
    appName: 'SmartRecruit',
    appDescription: 'Aplikasi Tracking System untuk Rekrutmen',

    // Defaults
    defaultCompanyName: 'SmartRecruit Demo',
    defaultPrimaryColor: '#3B82F6',
};

// Mock Data untuk Development tanpa Database
export const mockJobs = [
    {
        id: 'mock-1',
        title: 'Senior Frontend Developer',
        department: 'Engineering',
        location: 'Jakarta, Indonesia',
        type: 'full-time' as const,
        salary_min: 15000000,
        salary_max: 25000000,
        description: 'Kami mencari Frontend Developer berpengalaman untuk membangun produk inovatif dengan React, Next.js, dan TypeScript.\n\nSebagai bagian dari tim, Anda akan bekerja sama dengan designer dan backend engineer untuk menciptakan produk yang inovatif dan user-friendly.',
        requirements: '- Minimal 3 tahun pengalaman sebagai Frontend Developer\n- Mahir dalam React.js, Next.js, dan TypeScript\n- Pengalaman dengan state management (Redux, Zustand, atau TanStack Query)\n- Familiar dengan CSS-in-JS atau Tailwind CSS\n- Pengalaman dengan Git dan collaborative development',
        benefits: '- Gaji kompetitif dengan review berkala\n- Asuransi kesehatan untuk karyawan dan keluarga\n- Flexible working arrangement (Hybrid/Remote)\n- Learning budget untuk pengembangan skill',
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        companies: { name: 'SmartRecruit Demo' },
    },
    {
        id: 'mock-2',
        title: 'Product Manager',
        department: 'Product',
        location: 'Remote',
        type: 'full-time' as const,
        salary_min: 20000000,
        salary_max: 35000000,
        description: 'Posisi strategis untuk memimpin pengembangan produk dari ide hingga launch dengan tim yang dinamis.',
        requirements: '- Minimal 3 tahun pengalaman sebagai Product Manager\n- Pengalaman dengan metodologi Agile/Scrum\n- Kemampuan analisis data yang kuat\n- Kemampuan komunikasi yang excellent',
        benefits: '- Gaji kompetitif\n- Stock options\n- Remote work',
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        companies: { name: 'SmartRecruit Demo' },
    },
    {
        id: 'mock-3',
        title: 'UI/UX Designer',
        department: 'Design',
        location: 'Bandung, Indonesia',
        type: 'full-time' as const,
        salary_min: 12000000,
        salary_max: 20000000,
        description: 'Desainer kreatif untuk menciptakan pengalaman pengguna yang luar biasa dan interface yang menarik.',
        requirements: '- Minimal 2 tahun pengalaman UI/UX\n- Mahir menggunakan Figma\n- Portfolio yang kuat\n- Pemahaman tentang user research',
        benefits: '- Gaji kompetitif\n- MacBook untuk bekerja\n- Cuti unlimited',
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        companies: { name: 'SmartRecruit Demo' },
    },
    {
        id: 'mock-4',
        title: 'DevOps Engineer',
        department: 'Engineering',
        location: 'Jakarta, Indonesia',
        type: 'contract' as const,
        salary_min: 18000000,
        salary_max: 30000000,
        description: 'Mengelola infrastruktur cloud dan CI/CD pipeline untuk tim engineering kami yang growing.',
        requirements: '- Pengalaman dengan AWS/GCP\n- Familiar dengan Docker dan Kubernetes\n- Pengalaman dengan CI/CD tools',
        benefits: '- Rate kompetitif\n- Remote friendly\n- Proyek menarik',
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        companies: { name: 'SmartRecruit Demo' },
    },
];

// Helper to get mock job by ID
export function getMockJobById(id: string) {
    return mockJobs.find(job => job.id === id) || null;
}

// ============================================
// MOCK DATA FOR DASHBOARD
// ============================================

// Mock candidates/applications for Pipeline and Candidates pages
export const mockCandidates = [
    { id: '1', tracking_id: 'APP-ABC123', name: 'Ahmad Rizki', email: 'ahmad@email.com', phone: '08123456789', position: 'Senior Frontend Developer', status: 'interview_1', score: 85, applied_at: '2026-01-05' },
    { id: '2', tracking_id: 'APP-DEF456', name: 'Siti Nurhaliza', email: 'siti@email.com', phone: '08234567890', position: 'Product Manager', status: 'screening', score: null, applied_at: '2026-01-06' },
    { id: '3', tracking_id: 'APP-GHI789', name: 'Budi Santoso', email: 'budi@email.com', phone: '08345678901', position: 'UI/UX Designer', status: 'applied', score: null, applied_at: '2026-01-07' },
    { id: '4', tracking_id: 'APP-JKL012', name: 'Dewi Kartika', email: 'dewi@email.com', phone: '08456789012', position: 'Backend Developer', status: 'test', score: 78, applied_at: '2026-01-04' },
    { id: '5', tracking_id: 'APP-MNO345', name: 'Eko Prasetyo', email: 'eko@email.com', phone: '08567890123', position: 'DevOps Engineer', status: 'offering', score: 92, applied_at: '2026-01-03' },
    { id: '6', tracking_id: 'APP-PQR678', name: 'Fitri Handayani', email: 'fitri@email.com', phone: '08678901234', position: 'HR Generalist', status: 'interview_2', score: 80, applied_at: '2026-01-02' },
    { id: '7', tracking_id: 'APP-STU901', name: 'Gunawan Wijaya', email: 'gunawan@email.com', phone: '08789012345', position: 'Frontend Developer', status: 'hired', score: 95, applied_at: '2025-12-28' },
    { id: '8', tracking_id: 'APP-VWX234', name: 'Hana Permata', email: 'hana@email.com', phone: '08890123456', position: 'Data Analyst', status: 'rejected', score: 65, applied_at: '2026-01-01' },
];

// Mock dashboard stats
export const mockDashboardStats = {
    totalApplicants: 248,
    activeJobs: 12,
    hiredThisMonth: 8,
    avgTimeToHire: 18,
};

// Mock jobs for dashboard (with applicant count)
export const mockDashboardJobs = [
    { id: 'mock-1', title: 'Senior Frontend Developer', department: 'Engineering', location: 'Jakarta', type: 'full-time', status: 'active', applicants: 45, created_at: '2026-01-01' },
    { id: 'mock-2', title: 'Product Manager', department: 'Product', location: 'Remote', type: 'full-time', status: 'active', applicants: 32, created_at: '2026-01-02' },
    { id: 'mock-3', title: 'UI/UX Designer', department: 'Design', location: 'Bandung', type: 'full-time', status: 'active', applicants: 28, created_at: '2026-01-03' },
    { id: 'mock-4', title: 'Backend Developer', department: 'Engineering', location: 'Surabaya', type: 'full-time', status: 'draft', applicants: 0, created_at: '2026-01-05' },
    { id: 'mock-5', title: 'DevOps Engineer', department: 'Engineering', location: 'Jakarta', type: 'contract', status: 'active', applicants: 18, created_at: '2025-12-28' },
    { id: 'mock-6', title: 'HR Generalist', department: 'Human Resources', location: 'Jakarta', type: 'full-time', status: 'closed', applicants: 52, created_at: '2025-12-15' },
];

// Mock pipeline summary
export const mockPipelineSummary = [
    { status: 'applied', count: 45 },
    { status: 'screening', count: 32 },
    { status: 'interview_1', count: 18 },
    { status: 'interview_2', count: 12 },
    { status: 'interview_3', count: 8 },
    { status: 'test', count: 6 },
    { status: 'offering', count: 4 },
    { status: 'hired', count: 8 },
];

// Mock recent applications for dashboard
export const mockRecentApplications = [
    { id: 1, name: 'Ahmad Rizki', position: 'Frontend Developer', status: 'screening', time: '2 jam lalu' },
    { id: 2, name: 'Siti Nurhaliza', position: 'Product Manager', status: 'interview_1', time: '4 jam lalu' },
    { id: 3, name: 'Budi Santoso', position: 'UI/UX Designer', status: 'applied', time: '5 jam lalu' },
    { id: 4, name: 'Dewi Kartika', position: 'Backend Developer', status: 'test', time: '1 hari lalu' },
    { id: 5, name: 'Eko Prasetyo', position: 'DevOps Engineer', status: 'offering', time: '1 hari lalu' },
];
