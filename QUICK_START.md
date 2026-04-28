# 🚀 Quick Start - ATS App Setup

## ✅ Yang Sudah Selesai

1. ✅ Node.js v22.19.0 terinstal
2. ✅ npm v10.9.3 terinstal
3. ✅ Semua dependensi (483 packages) terinstal
4. ✅ File `.env.local` template sudah dibuat

---

## 📝 Langkah Selanjutnya

### 1. Setup Environment Variables

**File `.env.local` sudah dibuat di root project**, tapi masih berisi placeholder. Anda perlu mengisi dengan credentials asli:

#### Buka file `.env.local` dan isi dengan nilai yang benar:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
RESEND_API_KEY=your_resend_api_key_here  # Optional
```

#### 📖 Panduan Lengkap:
Baca file **`ENV_SETUP_GUIDE.md`** untuk instruksi detail cara mendapatkan semua credentials.

---

### 2. Jalankan Development Server

Setelah `.env.local` diisi dengan benar:

```bash
npm run dev
```

Aplikasi akan berjalan di: **http://localhost:3000**

---

## 🗂️ Struktur Project

```
ATS_App/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/             # Utilities & configurations
│   │   ├── supabase/    # Supabase client setup
│   │   ├── validations/ # Zod schemas
│   │   └── resend.ts    # Email service
│   └── ...
├── supabase/
│   └── schema.sql       # Database schema
├── public/              # Static assets
├── .env.local          # Environment variables (JANGAN COMMIT!)
├── ENV_SETUP_GUIDE.md  # Panduan setup environment
└── package.json        # Dependencies
```

---

## 🎯 Fitur Utama

- **Applicant Tracking System (ATS)** untuk HR
- **Job Management** - Kelola lowongan pekerjaan
- **Application Pipeline** - Track status lamaran
- **Candidate Profiles** - Data lengkap pelamar
- **Email Automation** - Kirim email otomatis ke pelamar
- **Analytics Dashboard** - Statistik dan laporan
- **Drag & Drop** - Pindahkan kandidat antar stage

---

## 🔧 Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint
```

---

## 📚 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **UI**: Radix UI + Tailwind CSS
- **Forms**: React Hook Form + Zod
- **State**: TanStack Query
- **Email**: Resend
- **Drag & Drop**: DnD Kit

---

## ⚠️ Catatan Penting

1. **Jangan commit `.env.local`** - File ini sudah di `.gitignore`
2. **Restart dev server** setelah mengubah environment variables
3. **Setup database schema** di Supabase sebelum menjalankan app
4. **Service Role Key** hanya untuk server-side, jangan expose ke client

---

## 🆘 Troubleshooting

### Error: Supabase connection failed
- Check apakah `.env.local` sudah diisi dengan benar
- Verify credentials di Supabase Dashboard
- Pastikan database schema sudah di-run

### Error: Module not found
- Jalankan: `npm install`
- Hapus `node_modules` dan `package-lock.json`, lalu `npm install` lagi

### Port 3000 sudah digunakan
- Ubah port: `npm run dev -- -p 3001`
- Atau stop aplikasi yang menggunakan port 3000

---

## 📞 Resources

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Next.js Docs**: https://nextjs.org/docs
- **Resend Docs**: https://resend.com/docs
- **Panduan Setup**: Baca `ENV_SETUP_GUIDE.md`
