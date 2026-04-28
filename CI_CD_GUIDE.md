# Panduan CI/CD & Deployment (SmartRecruit ATS)

Dokumentasi ini menjelaskan alur kerja (workflow) Continuous Integration (CI) dan Continuous Deployment (CD) yang telah dikonfigurasi pada repositori ini. Karena aplikasi ini ditargetkan sebagai SaaS (Software as a Service) dan "dijual lepas", menggunakan Docker adalah pilihan yang paling terukur.

---

## 1. Alur Kerja (Workflow) yang Tersedia

Proyek ini menggunakan **GitHub Actions** untuk menjalankan pipeline CI/CD. Terdapat dua *workflow* utama:

### A. CI (Continuous Integration) - `ci.yml`
- **Kapan berjalan?** Setiap kali ada `push` atau `pull request` (PR) ke branch `main` atau `master`.
- **Apa yang dilakukan?**
  1. **Security Scan**: Mencari kebocoran rahasia menggunakan Gitleaks.
  2. **Dependency Audit**: Memastikan library aman dengan `npm audit`.
  3. **Linting**: Pengecekan kualitas kode.
  4. **Automated Testing**: Menjalankan unit test dengan Vitest.
  5. **Build Check**: Memastikan proyek dapat di-build.
  
### B. CD (Continuous Deployment) - `cd-docker.yml`
- **Kapan berjalan?** Setiap kali Anda membuat _Release Tag_ baru (`v*.*.*`).
- **Apa yang dilakukan?**
  1. **Build & Push**: Membuat Docker Image dan dikirim ke GitHub Container Registry.
  2. **Container Scan**: Memindai kerentanan Docker Image menggunakan Trivy.
  3. **Automated Deploy (Opsional)**: *Catatan: Fitur ini secara default dinonaktifkan (di-comment).* Jika diaktifkan, server VPS akan menarik image terbaru dan restart otomatis via SSH.

---

## 2. Persiapan Repositori (Wajib)

Agar Github Actions dapat melakukan tugasnya tanpa *error*, Anda harus menyiapkan **GitHub Secrets**. Pipeline CI (_build process_) di Next.js membutuhkan *Environment Variables* saat di-_build_.

### Cara Menambahkan Secrets di GitHub:
1. Buka repositori proyek ini di browser web (GitHub).
2. Klik tab **Settings** di bagian atas.
3. Pada *sidebar* kiri, scroll ke bawah ke bagian **Security**, lalu klik **Secrets and variables** -> **Actions**.
4. Di tab "Secrets", klik tombol hijau **New repository secret**.

### Daftar Secrets yang Wajib Ditambahkan:

| Nama Secret | Deskripsi / Sumber Nilai |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL proyek Supabase Anda |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | API Key anonim Supabase |

*Jika sewaktu-waktu Anda memiliki VPS dan mengaktifkan fitur Deploy di `cd-docker.yml`, tambahkan juga:*
| `DEPLOY_HOST` | IP Address / Domain VPS tujuan |
| `DEPLOY_USERNAME` | Username login SSH VPS (misal: `root`) |
| `DEPLOY_KEY` | SSH Private Key untuk akses otomatis ke server |

*(Catatan: Jika Anda menambahkan integrasi *third-party* lain di frontend (misal Resend API) dan Next.js memerlukannya saat build, pastikan Anda juga menambahkannya di *Secrets* GitHub dan ke file `.github/workflows/ci.yml` pada bagian `env:`)*.

---

## 3. Cara Menggunakan (Trigger) Pipeline

### Trigger Pipeline CI
Cukup lakukan commit lalu _push_ kode Anda ke branch `main`:
```bash
git add .
git commit -m "feat: menambah halaman dashboard HR"
git push origin main
```
Pipeline CI akan otomatis berjalan untuk memastikan kode yang di-push stabil.

### Trigger Pipeline CD (Publish Release)
Untuk membuat rilis produk baru (mem-build Docker Image dan me-publish ke GHCR):
```bash
# 1. Pastikan Anda berada di branch utama dan kode sudah ter-commit
git tag v1.0.0
git push origin v1.0.0
```
Setelah command di atas dijalankan, GitHub Actions akan membuat _Docker Image_ versi `1.0.0` dan menyimpannya di _packages_ repositori Anda (tersedia di beranda profil repositori Anda pada bagian "Packages").

---

## 4. Cara Deploy ke Server (VPS / Cloud)

Karena kita sudah menyiapkan `docker-compose.yml`, proses *deployment* di server atau VPS manapun akan sangat instan.

1. Hubungkan / *login* via SSH ke VPS klien Anda.
2. Pastikan Docker dan Docker Compose telah terinstall di server klien.
3. Buat direktori aplikasi dan sebuah file `.env`:
   ```bash
   mkdir ats-app && cd ats-app
   nano .env
   ```
4. Masukkan *environment variables* yang krusial ke dalam file `.env`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   # Tambahkan KEY Resend dll jika nanti diperlukan di sisi Backend.
   ```
5. Simpan file `docker-compose.yml` (yang ada di *root* folder proyek ini) berdampingan dengan `.env`. Anda mungkin perlu sedikit memodifikasi file `docker-compose.yml` pada baris `build: .` menjadi `image: ghcr.io/<username_anda>/<nama_repo>:v1.0.0` jika Anda mengambil image langsung dari GHCR.
   
   **Contoh penyesuaian `docker-compose.yml` untuk VPS Klien:**
   ```yaml
   version: '3.8'
   services:
     web:
       image: ghcr.io/username_github_anda/ats-app:v1.0.0
       ports:
         - "3000:3000"
       env_file:
         - .env
       restart: always
   ```
6. Eksekusi (*run*) aplikasinya:
   ```bash
   docker-compose up -d
   ```
Aplikasi ATS Anda sekarang sudah *live* dan berjalan mandiri (standalone) secara background!
