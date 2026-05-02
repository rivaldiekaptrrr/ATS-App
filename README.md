# SmartRecruit ATS (Applicant Tracking System)

## 📌 Apa itu SmartRecruit ATS?

**SmartRecruit** adalah sebuah sistem manajemen rekrutmen (Applicant Tracking System) modern yang dirancang untuk memudahkan tim HR dalam mengelola lowongan pekerjaan, melacak progres lamaran kandidat (pipeline), dan mengambil keputusan rekrutmen berbasis data.

Aplikasi ini menyajikan antarmuka yang intuitif untuk pelamar umum sekaligus dashboard komprehensif bagi administrator HR.

---

## 🚀 Fitur Utama

- **Portal Lowongan Publik**: Halaman karir publik yang bersih dan responsif bagi kandidat untuk mencari dan melamar pekerjaan.
- **Dashboard HR**: Ringkasan metrik rekrutmen seperti total pelamar, waktu rata-rata rekrutmen, dan lowongan aktif.
- **Automation & Intelligence (AI)**: Fitur cerdas yang mengotomatiskan tugas repetitif dan memberikan insight berbasis data (Lihat detail di bawah).
- **Manajemen Lowongan (Job Management)**: Pembuatan, pengeditan, dan pengelolaan status (Draft, Active, Closed) lowongan pekerjaan dengan fitur *rich-text editor*.
- **Pipeline Rekrutmen (Kanban Board)**: Lacak status pelamar (Screening, Interview, Test, Offering, Hired, Rejected) dengan antarmuka yang mudah divisualisasikan.
- **Profil Kandidat Lengkap**: Penyimpanan data pelamar secara terpusat untuk mempermudah evaluasi.
- **Manajemen Tim HR**: Mendukung pembuatan akun kolaborator/rekruiter tambahan dalam satu perusahaan (*Role-based access*).
- **Mode Fleksibel (Mock vs Real Database)**: Aplikasi ini mendukung peralihan mulus antara data dummy (untuk testing) dan database produksi.

---

## 🤖 Automation & Intelligence

Fitur unggulan SmartRecruit yang mentransformasi proses rekrutmen manual menjadi otomatis dan cerdas:

1. **CV Auto-Parsing**: Pelamar cukup mengunggah file PDF, dan sistem akan otomatis mengekstrak Nama, Email, Telepon, dan Ringkasan Profil untuk mengisi formulir secara instan.
2. **AI Resume Scoring**: Setiap kandidat diberikan skor kecocokan (0-100) secara otomatis berdasarkan perbandingan antara *skill* di CV dengan persyaratan lowongan pekerjaan.
3. **Email Automation**: Sistem secara otomatis mengirimkan email notifikasi (undangan interview, pengumuman hasil, dll) kepada pelamar setiap kali HR memindahkan status kandidat di papan Pipeline.
4. **Duplicate Detection**: Mencegah lamaran ganda dari email yang sama untuk posisi yang sama, memastikan integritas data dalam pipeline.
5. **Intelligence Center**: Dashboard khusus yang menampilkan statistik performa otomasi, akurasi parsing, dan tren keterampilan (*top skills*) yang dimiliki oleh para pelamar.

---

## 🛠️ Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan tumpukan teknologi (tech stack) yang sangat modern untuk menjamin performa dan skalabilitas:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Server Actions)
- **Bahasa**: TypeScript
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Email Service**: [Resend](https://resend.com/)
- **AI Integration**: OpenAI (Optional for advanced parsing)
- **Styling**: Tailwind CSS & [Radix UI](https://www.radix-ui.com/) (shadcn/ui)
- **State Management**: TanStack React Query
- **Form & Validasi**: React Hook Form + Zod
- **Ikon**: Lucide React

---

## 🔄 Mode Operasional: Mock Data vs Supabase

Aplikasi ini memiliki keunggulan dapat dijalankan dalam **Dua Mode** berbeda. Hal ini sangat berguna bagi *developer* atau klien untuk mendemonstrasikan aplikasi tanpa perlu repot mengatur database (Supabase) terlebih dahulu.

Pengaturannya sangat mudah, cukup ubah variabel `NEXT_PUBLIC_USE_MOCK_DATA` di dalam file `.env.local`.

### 1. Mode Mock Data (Tanpa Database)
**Sangat cocok untuk demonstrasi cepat, pengembangan UI, atau jika Anda belum setup Supabase.**
- Aktifkan dengan menyetel `NEXT_PUBLIC_USE_MOCK_DATA=true`.
- **Bypass Keseluruhan**: Sistem otomatis memotong (*bypass*) semua pemanggilan autentikasi dan database ke Supabase.
- **AI Simulation**: Fitur Scoring, Parsing, dan Email Automation berjalan menggunakan simulasi cerdas (log ke console/toast).
- **Cara Login HR**: Gunakan kredensial bawaan berikut:
  - **Email Demo**: `admin@example.com`
  - **Password Demo**: `admin123`

### 2. Mode Supabase (Database Asli)
**Untuk tahap produksi (Production) atau pengujian backend nyata.**
- Aktifkan dengan menyetel `NEXT_PUBLIC_USE_MOCK_DATA=false`.
- **Fungsionalitas Penuh**: Semua data tersimpan aman secara *real-time* di database PostgreSQL Supabase.
- **Integrasi Email**: Memerlukan `RESEND_API_KEY` untuk mengirim email notifikasi asli ke pelamar.

---

## 📦 Panduan Instalasi & Menjalankan Aplikasi

### 1. Kloning dan Instalasi Dependencies
```bash
git clone <repository-url>
cd ATS-App
npm install
```

### 2. Konfigurasi Environment Variables
Salin file template `.env.example` menjadi `.env.local` dan isi nilainya.

### 3. Menjalankan Server Pengembangan (Development)
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000).

---

## 🗂️ Struktur Direktori Utama

- `/src/app` - Berisi semua halaman berbasis routing Next.js terbaru.
  - `/dashboard/intelligence` - Dashboard AI & Automation stats.
- `/src/lib` - *Core logic* aplikasi.
  - `/services/scoring.ts` - Logika AI Resume Scoring.
  - `/services/emailAutomation.ts` - Pemicu email otomatis.
  - `/services/dedup.ts` - Pendeteksi lamaran ganda.
- `/src/constants` - Berisi konstanta global (seperti template email dan tahapan *Pipeline*).

---

## 💡 Tips & Troubleshooting
- Restart *dev server* (`npm run dev`) setiap kali Anda membuat perubahan pada file `.env.local`.
- Pastikan `RESEND_API_KEY` terkonfigurasi jika ingin menguji fitur pengiriman email asli di luar mode mock.
