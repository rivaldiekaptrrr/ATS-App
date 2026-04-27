# ✅ Integrasi Supabase - Buat Lowongan

## 🎯 Status: SELESAI TERINTEGRASI!

Fitur **"Buat Lowongan Baru"** sudah **100% terintegrasi dengan Supabase**.

---

## 🔄 Flow yang Sudah Berfungsi:

### 1. **HR Membuat Lowongan** (`/dashboard/jobs/new`)
   - HR mengisi form lengkap (judul, departemen, lokasi, gaji, deskripsi, dll)
   - Klik **"Simpan Draft"** → Status = `draft` (tidak tampil di public)
   - Klik **"Publikasi Lowongan"** → Status = `active` (langsung tampil di `/jobs`)
   - Data tersimpan ke database Supabase table `jobs`

### 2. **Pelamar Melihat Lowongan** (`/jobs`)
   - Fetch data **langsung dari Supabase**
   - Hanya menampilkan lowongan dengan status = `active`
   - Real-time: lowongan yang baru dipublikasi **langsung muncul** (setelah refresh)
   - Filter berdasarkan: lokasi, tipe pekerjaan, keyword

### 3. **Manajemen Draft**
   - Draft disimpan di database
   - HR bisa edit draft kapan saja (future feature)
   - HR bisa publish draft kapan saja (future feature)

---

## 📁 File yang Dibuat/Diupdate:

### ✅ Baru Dibuat:
1. **`src/lib/services/jobs.ts`**
   - Service layer untuk semua operasi job
   - CRUD functions: create, read, update, delete
   - Type-safe dengan TypeScript

2. **`src/components/RichTextEditor.tsx`**
   - Markdown editor dengan toolbar
   - Auto-resize, character counter
   - Support bold, italic, headings, lists, links, dll

3. **`src/app/dashboard/jobs/new/page.tsx`**
   - Form lengkap untuk buat lowongan
   - Validation dengan Zod
   - Salary formatter Rupiah
   - Draft vs Publish option

### ✅ Diupdate:
1. **`src/app/jobs/page.tsx`**
   - Dari mock data → Supabase integration
   - Search & filter functionality
   - Loading states
   - Empty states

2. **`src/app/globals.css`**
   - Added required label styling (red asterisk)

---

## 🗄️ Database Schema (Supabase)

Table: **`jobs`**

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  title VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  location VARCHAR(255),
  type VARCHAR(50),  -- 'full-time', 'part-time', 'contract', 'internship'
  salary_min INTEGER,
  salary_max INTEGER,
  description TEXT,
  requirements TEXT,
  benefits TEXT,
  status VARCHAR(20) DEFAULT 'draft',  -- 'draft', 'active', 'closed'
  created_by UUID REFERENCES hr_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
```

**Pastikan schema sudah di-run di Supabase SQL Editor!**

---

## 🧪 Testing Guide

### Test 1: Buat Lowongan Baru (Draft)
1. Login sebagai HR
2. Buka `/dashboard/jobs`
3. Klik **"Buat Lowongan"**
4. Isi semua field required
5. Klik **"Simpan Draft"**
6. ✅ Muncul toast: "Lowongan berhasil disimpan sebagai draft"
7. ✅ Redirect ke `/dashboard/jobs`
8. ✅ Lowongan draft TIDAK muncul di `/jobs` (public)

### Test 2: Publikasi Lowongan
1. Login sebagai HR
2. Buka `/dashboard/jobs/new`
3. Isi form lengkap
4. Klik **"Publikasi Lowongan"**
5. ✅ Muncul toast: "Lowongan berhasil dipublikasi dan tampil di halaman pelamar!"
6. ✅ Redirect ke `/dashboard/jobs`
7. Buka `/jobs` (public page)
8. ✅ Lowongan baru **LANGSUNG MUNCUL** di list!

### Test 3: Pencarian & Filter
1. Buka `/jobs`
2. Coba search keyword
3. Coba filter lokasi
4. Coba filter tipe pekerjaan
5. ✅ List ter-filter real-time

---

## ⚙️ Environment Setup Required

Pastikan `.env.local` sudah diisi dengan benar:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

---

## 🚀 Next Steps (Future Enhancement)

- [ ] Edit lowongan yang sudah ada
- [ ] Delete lowongan
- [ ] Bulk publish draft
- [ ] Auto-close lowongan berdasarkan `expires_at`
- [ ] Job analytics (views, applications)
- [ ] Duplicate/Clone lowongan
- [ ] Template lowongan

---

## 🐛 Troubleshooting

### Error: "Gagal membuat lowongan"

**Kemungkinan penyebab:**
1. Database schema belum di-run
2. RLS (Row Level Security) terlalu ketat
3. Company ID tidak ada di database

**Solusi:**
1. Run `supabase/schema.sql` di Supabase SQL Editor
2. Pastikan company default sudah ter-insert
3. Check console browser untuk error detail

### Lowongan tidak muncul di `/jobs`

**Kemungkinan:**
1. Status masih `draft` (bukan `active`)
2. Browser cache

**Solusi:**
1. Pastikan klik "Publikasi Lowongan" bukan "Simpan Draft"
2. Hard refresh (Ctrl+Shift+R)

---

## 📊 Fitur yang Sudah Berfungsi

| Fitur | Status | Keterangan |
|-------|--------|------------|
| Buat lowongan | ✅ | Fully integrated |
| Simpan draft | ✅ | Status = draft |
| Publikasi | ✅ | Status = active |
| List public | ✅ | Hanya active jobs |
| Search | ✅ | By title, dept, desc |
| Filter lokasi | ✅ | Dropdown filter |
| Filter tipe | ✅ | Full-time, contract, dll |
| Rich text editor | ✅ | Markdown support |
| Salary formatter | ✅ | Rupiah dengan validation |
| Form validation | ✅ | Zod schema |

---

## 💡 Tips

1. **Markdown Support**: Editor mendukung markdown, bisa pakai:
   - `**bold**` untuk bold
   - `*italic*` untuk italic
   - `- item` untuk bullet list
   - `## Heading` untuk heading
   
2. **Salary**: Bisa diisi atau dikosongkan. Jika dikosongkan, akan tampil "Gaji Kompetitif"

3. **Expires Date**: Optional. Jika diisi, lowongan bisa auto-close nanti (future feature)

---

Selamat! Sistem buat lowongan sudah fully functional! 🎉
