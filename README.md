# SmartRecruit ATS (Applicant Tracking System)

## 📌 Apa itu SmartRecruit ATS?

**SmartRecruit** adalah sebuah sistem manajemen rekrutmen (Applicant Tracking System) modern yang dirancang untuk memudahkan tim HR dalam mengelola lowongan pekerjaan, melacak progres lamaran kandidat (pipeline), dan mengambil keputusan rekrutmen berbasis data.

Aplikasi ini menyajikan antarmuka yang intuitif untuk pelamar umum sekaligus dashboard komprehensif bagi administrator HR.

---

## 🚀 Fitur Utama

- **Portal Lowongan Publik**: Halaman karir publik yang bersih dan responsif bagi kandidat untuk mencari dan melamar pekerjaan.
- **Dashboard HR**: Ringkasan metrik rekrutmen seperti total pelamar, waktu rata-rata rekrutmen, dan lowongan aktif.
- **Manajemen Lowongan (Job Management)**: Pembuatan, pengeditan, dan pengelolaan status (Draft, Active, Closed) lowongan pekerjaan dengan fitur *rich-text editor*.
- **Pipeline Rekrutmen (Kanban Board)**: Lacak status pelamar (Screening, Interview, Test, Offering, Hired, Rejected) dengan antarmuka yang mudah divisualisasikan.
- **Profil Kandidat Lengkap**: Penyimpanan data pelamar secara terpusat untuk mempermudah evaluasi.
- **Manajemen Tim HR**: Mendukung pembuatan akun kolaborator/rekruiter tambahan dalam satu perusahaan (*Role-based access*).
- **Mode Fleksibel (Mock vs Real Database)**: Aplikasi ini mendukung peralihan mulus antara data dummy (untuk testing) dan database produksi.

---

## 🛠️ Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan tumpukan teknologi (tech stack) yang sangat modern untuk menjamin performa dan skalabilitas:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Server Actions)
- **Bahasa**: TypeScript
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
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
- **Bypass Keseluruhan**: Sistem otomatis memotong (*bypass*) semua pemanggilan autentikasi dan database ke Supabase. Aplikasi tidak akan *crash* meskipun Supabase URL/Key kosong.
- **Data Palsu Lengkap**: Menampilkan data *dummy* otomatis (termasuk statistik pelamar, pipeline kanban, dan daftar pekerjaan).
- **Cara Login HR**: Anda tidak perlu daftar, gunakan kredensial bawaan berikut:
  - **Email Demo**: `admin@example.com`
  - **Password Demo**: `admin123`

### 2. Mode Supabase (Database Asli)
**Untuk tahap produksi (Production) atau pengujian backend nyata.**
- Aktifkan dengan menyetel `NEXT_PUBLIC_USE_MOCK_DATA=false` (atau dengan menghapus variabel tersebut dari file .env).
- **Membutuhkan Konfigurasi**: Anda diwajibkan untuk mengisi `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY` di `.env.local`.
- **Fungsionalitas Penuh**: Semua pendaftaran, proses *login*, pembuatan lowongan, dan lamaran kandidat akan tersimpan aman dan permanen secara *real-time* di database PostgreSQL Anda.

---

## 📦 Panduan Instalasi & Menjalankan Aplikasi

### 1. Kloning dan Instalasi Dependencies
Pastikan [Node.js](https://nodejs.org) (direkomendasikan v18+) telah terinstal di komputer Anda.

```bash
git clone <repository-url>
cd ATS-App
npm install
```

### 2. Konfigurasi Environment Variables
Salin file template yang tersedia menjadi `.env.local`.

```bash
cp .env.example .env.local
```

Buka file `.env.local` dan tentukan mode mana yang ingin Anda gunakan.

**Untuk demonstrasi lokal (Mode Mock Data):**
```env
NEXT_PUBLIC_USE_MOCK_DATA=true
# (Nilai Supabase URL/Key di bawahnya tidak akan dievaluasi dan bisa dihiraukan)
```

**Untuk produksi (Mode Supabase):**
```env
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Menjalankan Server Pengembangan (Development)
```bash
npm run dev
```

Buka browser favorit Anda dan kunjungi [http://localhost:3000](http://localhost:3000).

---

## 🗂️ Struktur Direktori Utama

- `/src/app` - Berisi semua halaman berbasis routing Next.js terbaru (Home, Detail Pekerjaan, Login, Dashboard HR, dll).
- `/src/components` - Komponen React UI yang konsisten dan dapat digunakan kembali.
- `/src/lib` - *Core logic* aplikasi. Berisi *Server Actions*, layanan database, konfigurasi Supabase, dan data *mock* cadangan.
- `/src/hooks` - *Custom React Hooks* (seperti integrasi TanStack Query).
- `/src/constants` - Berisi konstanta global (seperti tahapan *Pipeline*).

---

## 💡 Tips & Troubleshooting
- Jika Anda mengaktifkan Mode Supabase dan mendapat peringatan *Network Error/Fetch Failed*, pastikan kredensial Supabase Anda sudah valid.
- Pastikan semua tabel di Supabase (seperti `companies`, `hr_users`, `jobs`, `applications`, `applicants`) telah dibuat dengan menggunakan SQL Schema yang tersedia di dalam dokumentasi terpisah (`ENV_SETUP_GUIDE.md` / `SUPABASE_INTEGRATION.md`).
- Restart *dev server* (`npm run dev`) setiap kali Anda membuat perubahan pada file `.env.local`.
