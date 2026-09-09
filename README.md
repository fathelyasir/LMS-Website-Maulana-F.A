# Kelasku — Kode Awal Aplikasi LMS (SMP & SMA)

Ini adalah titik awal implementasi dari dokumen **SRS Aplikasi LMS** yang sebelumnya
dibuat, dengan penyesuaian agar cocok untuk jenjang **SMP dan SMA sederajat**
(bukan mahasiswa/perguruan tinggi). Karena aplikasi LMS penuh butuh backend,
basis data, autentikasi sungguhan, dsb — yang tidak realistis dibangun utuh dalam satu
sesi — file di sini adalah **landing page yang sudah jadi dan bisa langsung dipakai**,
ditambah **kode awal (starter code)** untuk halaman-halaman inti lain yang bisa kamu
lanjutkan sesuai kebutuhan tugas.

## Menjalankan aplikasi

Pastikan Node.js 18 atau lebih baru sudah terpasang, lalu jalankan:

```bash
npm install
npm run dev
```

Jalur yang paling stabil adalah menjalankan Vite dari folder proyek, lalu membuka
alamat HTTP-nya di browser. `landing.html` dan `index.html` juga sudah memakai path
relatif agar tombol navigasinya tidak keluar dari folder proyek saat dibuka lokal.
Jika VS Code menampilkan `Forbidden. File does not reside within a trusted folder`,
pilih **File > Open Folder** dan buka folder
`C:\Project_Aplikasi_LMS_Maulana-F.A_XI-RPL-1`, kemudian pilih **Trust** saat VS Code
meminta konfirmasi (**Ctrl+Shift+P** → **Workspace: Manage Workspace Trust**).

Server development yang dapat diakses melalui jaringan:

```bash
npm run dev:public
```

Lalu buka `http://localhost:5173/` di komputer ini atau
`http://10.11.13.27:5173/` dari perangkat lain pada Wi-Fi/LAN yang sama.

Buka `http://localhost:5173/` di komputer ini. Agar bisa dibuka dari HP atau komputer
lain pada jaringan Wi-Fi/LAN yang sama, gunakan `npm run dev:public`, lalu buka
`http://10.11.13.27:5173` atau alamat IP yang ditampilkan Vite. Pastikan Windows
Firewall mengizinkan Node.js pada jaringan Private.

Untuk menguji versi production hasil build:

```bash
npm run build
npm run preview:public
```

Buka alamat `Network` yang ditampilkan Vite dari HP, tablet, atau komputer lain
yang terhubung ke Wi-Fi/LAN yang sama. Pastikan perangkat penguji tidak memakai
VPN yang memisahkan jaringan dan gunakan alamat IP komputer yang menjalankan
server, bukan `localhost`.

Data demo disimpan di `localStorage` masing-masing browser. Artinya akun dan
perubahan data di setiap perangkat belum tersinkronisasi satu sama lain. Agar
menjadi aplikasi publik multi-pengguna, aplikasi ini masih membutuhkan backend,
database, autentikasi server, dan penyimpanan file terpusat.

Server ini belum menjadi server internet umum. Untuk akses dari luar jaringan,
gunakan deployment seperti Vercel/Netlify atau tunnel seperti Cloudflare Tunnel.

Login demo:

- Siswa: `0051234561` / `siswa123`
- Guru: `sari@sekolah.sch.id` / `guru123`
- Admin: `admin@sekolah.sch.id` / `admin123`

Route utama:

- `#/masuk` — halaman login
- `#/daftar` — registrasi siswa dengan kode kelas
- `#/guru/kelas`, `#/guru/tugas`, `#/guru/kuis`, `#/guru/forum`, `#/guru/live` — modul kerja guru
- `#/siswa/kelas`, `#/siswa/tugas`, `#/siswa/kuis`, `#/siswa/forum`, `#/siswa/live`, `#/siswa/nilai` — modul belajar siswa
- `#/admin/akun` — menambahkan akun siswa, guru, atau admin; akun siswa langsung ditautkan ke kelas

Data akun tanpa password juga tersedia di `data-akun.json`. Admin dapat mengunduh
versi terbaru dari menu `/admin/akun`; file tersebut memuat akun terdaftar, jumlah
login, waktu login terakhir, role, dan kelas terkait bila tersedia.

## Isi folder

```
lms-app/
├── index.html                   ← Entry HTML aplikasi React
├── main.jsx                     ← Entry point React
├── App.jsx                      ← Provider dan routing utama
├── landing.html                 ← Landing page statis yang tetap bisa dibuka langsung
├── README.md                    ← File ini
├── tokens.css                   ← Warna, font, radius bersama
├── Authcontext.jsx              ← Session dan autentikasi demo
├── Protectedroute.jsx            ← Proteksi halaman berdasarkan peran
├── Dashboardshell.jsx            ← Layout dashboard bersama
├── LoginPage.jsx                ← Login & lupa sandi (FR-01 s.d. FR-04)
├── GuruDashboardView.jsx        ← Ringkasan kelas, tugas perlu dinilai, live class
└── SiswaDashboardView.jsx       ← Tugas aktif, ulangan mendatang, nilai terbaru
```

`landing.html` bisa langsung dibuka di browser tanpa instalasi apa pun. Aplikasi
React menggunakan `Db.js` sebagai backend tiruan berbasis `localStorage`, sehingga
login dan session demo dapat berjalan tanpa server database. Ini siap digunakan
sebagai demo/prototype lokal; untuk penggunaan sekolah sungguhan, autentikasi,
password, file upload, dan data akademik wajib dipindahkan ke backend/database
terproteksi. Jangan gunakan data siswa nyata pada mode demo ini.

## Penyesuaian dari dokumen SRS asli

Dokumen SRS awal ditulis untuk konteks perguruan tinggi. Untuk SMP/SMA, istilah dan
beberapa alur disesuaikan:

| SRS asli (kampus) | Versi SMP/SMA |
|---|---|
| Dosen | **Guru** |
| Mahasiswa | **Siswa** |
| Mata kuliah | **Mata pelajaran (mapel)** |
| NIM / NIP | **NISN** (siswa) / **NIP** (guru) |
| Kelas (mis. "Kelas A") | **Rombel** (mis. "VIII-A", "XI IPA 2") |

## Fitur tambahan yang diusulkan (di luar SRS awal)

Sesuai arahan untuk menyesuaikan dengan konteks sekolah menengah, tiga fitur berikut
ditambahkan ke landing page dan disarankan masuk ke SRS versi revisi:

1. **Absensi Digital** — presensi otomatis saat siswa membuka kelas/bergabung live class.
2. **Portal Orang Tua** — orang tua bisa memantau nilai dan kehadiran anak.
3. **Rapor Semester** — rekap nilai otomatis per mapel dan per semester (perluasan dari FR-18).

## Rekomendasi tumpukan teknologi (tech stack) untuk lanjutan

Karena ini tugas RPL, stack berikut cukup umum diajarkan dan mudah didokumentasikan:

- **Frontend:** React (Vite) + React Router untuk navigasi antar dashboard
- **Styling:** lanjutkan pendekatan `tokens.css` di sini, atau migrasikan ke Tailwind
- **Backend:** REST API (Node.js/Express atau Laravel) sesuai FR-01 s.d. FR-33 di SRS
- **Basis data:** MySQL/PostgreSQL — entitas utama: `users`, `roles`, `kelas`,
  `materi`, `tugas`, `pengumpulan_tugas`, `kuis`, `soal`, `nilai`, `forum_topik`,
  `live_class`, `absensi`
- **Autentikasi:** JWT atau session-based, dengan middleware pembeda peran (FR-04)

## Langkah lanjutan yang disarankan

1. Sambungkan `LoginPage.jsx` ke endpoint autentikasi sungguhan.
2. Buat halaman **Kelola Kelas** (FR-06–09) dan **Unggah Materi** (FR-10–13) di sisi Guru.
3. Buat halaman **Pengumpulan Tugas** di sisi Siswa (unggah berkas, lihat status).
4. Buat modul **Kuis/Ujian** dengan bank soal dan penilaian otomatis (FR-20–24).
5. Tambahkan **routing** (React Router) supaya `landing.html` → `LoginPage` →
   `DashboardGuru`/`DashboardSiswa` menjadi satu alur aplikasi yang utuh.

Kalau kamu mau, bagian-bagian di langkah 2–4 bisa dibuatkan starter code-nya juga
di sesi berikutnya, satu per satu.
