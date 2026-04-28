# 🔐 Panduan Setup Environment Variables

## Overview

Aplikasi ini membutuhkan beberapa environment variables untuk berfungsi dengan baik.
File `.env.local` tidak ikut di-commit ke Git karena berisi informasi sensitif seperti API keys dan credentials.
Copy file `.env.example` ke `.env.local` dan isi dengan nilai yang sesuai.

## 🎯 Quick Start (Development Mode)

Jika Anda **TIDAK** memiliki Supabase setup, Anda bisa menggunakan **Mock Mode**:

```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

Dengan setting ini, aplikasi akan menggunakan data dummy tanpa perlu database!

---

## 📋 Langkah-langkah Setup

### 1. Buat File `.env.local`

Buat file baru bernama `.env.local` di root folder project (`d:\Project\ATS_App\.env.local`)

### 2. Copy Template Berikut

```env
# ============================================
# SUPABASE CONFIGURATION
# ============================================
# Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Anon/Public Key (safe to use in browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase Service Role Key (KEEP SECRET! Server-side only)
# ⚠️ WARNING: Never expose this key in client-side code
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here


# ============================================
# RESEND EMAIL SERVICE (Optional)
# ============================================
# Get your API key from: https://resend.com/api-keys
# Used for sending automated emails to applicants

RESEND_API_KEY=re_your_resend_api_key_here
```

---

## 🔑 Cara Mendapatkan Supabase Credentials

### Opsi A: Gunakan Project Supabase yang Sudah Ada

1. **Login ke Supabase Dashboard**
   - Buka: https://supabase.com/dashboard
   - Login dengan akun yang digunakan untuk project ini

2. **Pilih Project Anda**
   - Cari project yang digunakan untuk ATS_App ini

3. **Dapatkan API Credentials**
   - Klik **Settings** (⚙️) di sidebar kiri
   - Klik **API** di menu Settings
   - Anda akan melihat:
     - **Project URL** → Copy ke `NEXT_PUBLIC_SUPABASE_URL`
     - **anon/public key** → Copy ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role key** → Copy ke `SUPABASE_SERVICE_ROLE_KEY`

### Opsi B: Buat Project Supabase Baru

Jika Anda belum punya project atau ingin membuat yang baru:

1. **Buat Project Baru**
   - Buka: https://supabase.com/dashboard
   - Klik **"New Project"**
   - Isi:
     - **Name**: ATS App (atau nama lain)
     - **Database Password**: Buat password yang kuat (SIMPAN password ini!)
     - **Region**: Pilih yang terdekat (Southeast Asia - Singapore)
   - Klik **"Create new project"**
   - Tunggu ~2 menit hingga project selesai dibuat

2. **Setup Database Schema**
   - Setelah project ready, klik **SQL Editor** di sidebar
   - Klik **"New query"**
   - Copy seluruh isi file `supabase/schema.sql` dari project ini
   - Paste ke SQL Editor
   - Klik **"Run"** atau tekan `Ctrl+Enter`
   - Pastikan semua query berhasil (✅ Success)

3. **Dapatkan API Credentials**
   - Ikuti langkah 3 dari **Opsi A** di atas

---

## 📧 Cara Mendapatkan Resend API Key (Opsional)

Resend digunakan untuk mengirim email otomatis ke pelamar. Jika Anda tidak memerlukan fitur email untuk saat ini, **lewati bagian ini**.

1. **Daftar di Resend**
   - Buka: https://resend.com
   - Klik **"Sign Up"** atau **"Get Started"**
   - Daftar dengan email Anda

2. **Dapatkan API Key**
   - Setelah login, buka: https://resend.com/api-keys
   - Klik **"Create API Key"**
   - Beri nama: `ATS App`
   - Copy API key yang diberikan
   - Paste ke `RESEND_API_KEY` di file `.env.local`

3. **Verifikasi Domain (Untuk Production)**
   - Untuk development, Anda bisa skip ini
   - Untuk production, Anda perlu verify domain email Anda

---

## ✅ Verifikasi Setup

Setelah mengisi `.env.local`, file Anda seharusnya terlihat seperti ini:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
RESEND_API_KEY=your_resend_api_key_here
```

### Test Koneksi

1. **Restart Development Server**
   ```bash
   # Stop server yang sedang running (Ctrl+C)
   npm run dev
   ```

2. **Buka Browser**
   - Buka: http://localhost:3000
   - Jika tidak ada error, setup berhasil! ✅

3. **Check Console**
   - Buka Developer Tools (F12)
   - Lihat tab Console
   - Tidak seharusnya ada error terkait Supabase

---

## 🚨 Troubleshooting

### Error: "Invalid API key"
- Pastikan Anda copy API key dengan benar (tidak ada spasi di awal/akhir)
- Pastikan Anda menggunakan project yang benar

### Error: "Database connection failed"
- Pastikan database schema sudah di-run
- Check apakah project Supabase masih aktif

### Error: "CORS error"
- Pastikan URL Supabase benar
- Check di Supabase Dashboard → Authentication → URL Configuration

---

## 📝 Catatan Penting

1. ⚠️ **JANGAN** commit file `.env.local` ke Git
2. ⚠️ **JANGAN** share `SUPABASE_SERVICE_ROLE_KEY` ke siapapun
3. ✅ File `.env.local` sudah ada di `.gitignore`
4. ✅ Restart dev server setiap kali mengubah environment variables
5. ✅ Untuk production, set environment variables di platform hosting (Vercel, Netlify, dll)

---

## 🎯 Struktur Database

Project ini menggunakan database schema yang sudah didefinisikan di `supabase/schema.sql`:

- **companies** - Data perusahaan
- **hr_users** - User HR/Admin
- **jobs** - Lowongan pekerjaan
- **applicants** - Data pelamar
- **applications** - Lamaran (junction table)
- **work_experiences** - Pengalaman kerja
- **education** - Riwayat pendidikan
- **skills** - Keahlian
- **email_templates** - Template email otomatis
- **activity_logs** - Log aktivitas
- **email_logs** - Log email terkirim

---

## 📞 Butuh Bantuan?

Jika masih ada masalah, check:
- Supabase Documentation: https://supabase.com/docs
- Resend Documentation: https://resend.com/docs
- Next.js Environment Variables: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
