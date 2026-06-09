# SakuKelas Portal (Website Transparansi Siswa)

SakuKelas Portal adalah platform web berbasis **Next.js** yang dirancang sebagai dashboard transparansi keuangan kelas untuk siswa. Portal ini bersifat **Read-Only** (Hanya Lihat), sehingga siswa dapat memantau uang kas kelas secara real-time tanpa perlu melakukan login akun, cukup dengan memasukkan kode kelas mereka.

---

## 🚀 Fitur Utama

- **Dashboard Transparansi Kas:**
  - *Live Balance:* Tampilan saldo kas kelas saat ini secara mencolok di halaman utama.
  - *Grafik Arus Kas (Recharts):* Visualisasi interaktif perbandingan uang kas masuk vs uang keluar bulanan.
  - *Aktivitas Terbaru:* Riwayat transaksi terbaru dalam urutan waktu (timeline).
- **Self-Check Status Iuran:**
  - Memungkinkan siswa melakukan pencarian nama mereka untuk melihat status iuran kelas.
  - Menampilkan kartu status pribadi (Lunas / Jumlah Tunggakan) beserta detail riwayat tanggal pembayarannya.
- **Galeri Pengeluaran & Bukti Nota:**
  - Menampilkan riwayat transaksi pengeluaran secara lengkap.
  - Setiap pengeluaran yang diunggah oleh Bendahara melalui aplikasi mobile dapat dilihat bukti fisiknya (foto nota/struk) dalam bentuk popup gambar interaktif.
- **Wall of Shame (Daftar Tunggakan Terbesar):**
  - Menampilkan daftar nama siswa dengan nominal tunggakan terbesar secara transparan sebagai pengingat sosial halus agar segera melunasi iuran.
- **Desain Modern "Emerald Finance":**
  - Tampilan profesional default Dark Mode dengan kombinasi warna Emerald/Teal untuk status lunas dan Rose untuk tunggakan.
  - Animasi transisi yang halus menggunakan Framer Motion.

---

## 🛠️ Teknologi yang Digunakan

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
- **Language:** TypeScript
- **Styling & UI Components:** [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database Client:** [Supabase Client](https://supabase.com/docs/reference/javascript/introduction) (`@supabase/supabase-js`)
- **Charting:** [Recharts](https://recharts.org/) untuk diagram visualisasi kas.
- **Animations:** [Framer Motion](https://www.framer.com/motion/) untuk micro-animations.
- **Icons:** [Lucide React](https://lucide.dev/) untuk koleksi ikon modern.

---

## 📁 Struktur Proyek

Berikut adalah struktur folder utama dalam direktori `website/`:

```text
src/
├── app/          # App Router Next.js (layout, page utama, & halaman dinamis c/[slug])
├── components/   # Komponen UI reusable (Card, Table, Dialog, Sheet, dsb.)
└── lib/          # Inisialisasi Supabase client & konfigurasi database
public/           # Aset statis seperti gambar dan logo
.env.local        # File konfigurasi lokal untuk Supabase URL & Anon Key
components.json   # Konfigurasi shadcn/ui
```

---

## 📥 Panduan Instalasi dan Menjalankan Proyek

Website ini merupakan bagian dari monorepo **SakuKelas** dan terletak di folder `/website`.

### Prasyarat:
Pastikan Anda sudah menginstal:
- [Node.js](https://nodejs.org/) (versi 18.x atau versi yang terbaru)
- npm, yarn, pnpm, atau bun

### Langkah-Langkah Run:

1. **Clone Repository Utama & Masuk ke Folder Website:**
   ```bash
   git clone https://github.com/ZyuuDev/webkassekolah.git
   cd webkassekolah/website
   ```

2. **Install Dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable:**
   Buat file `.env.local` di folder `website/` (jika belum ada) dan isi dengan kredensial Supabase Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```

5. **Buka di Browser:**
   Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## 🔐 Keamanan & Row Level Security (RLS)
Untuk keamanan data, tabel Supabase dikonfigurasi menggunakan **Row Level Security (RLS)** yang membatasi hak akses dari sisi client website:
- Akses website dibatasi secara ketat hanya untuk operasi **`SELECT` (Read-Only)** berdasarkan *slug* kelas.
- Operasi manipulasi data (`INSERT`, `UPDATE`, `DELETE`) diblokir sepenuhnya di sisi website dan hanya diizinkan melalui autentikasi Bendahara di aplikasi mobile.
