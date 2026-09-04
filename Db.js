// src/lib/db.js
const DB_KEY = "kelasku_db_v1";

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function nowISO() {
  return new Date().toISOString();
}

function seedData() {
  const dibuat = nowISO();
  const guru1 = { id: "guru_sari", nama: "Sari Wulandari", peran: "guru", identifier: "sari@sekolah.sch.id", password: "guru123", mapel: "Matematika", dibuatAt: dibuat, jumlahLogin: 0, terakhirLogin: null };
  const guru2 = { id: "guru_andi", nama: "Andi Pratama", peran: "guru", identifier: "andi@sekolah.sch.id", password: "guru123", mapel: "IPA" };
  const admin1 = { id: "admin_1", nama: "Admin Sekolah", peran: "admin", identifier: "admin@sekolah.sch.id", password: "admin123" };

  const siswaSeed = [
    { id: "siswa_raka", nama: "Raka Saputra", nisn: "0051234561" },
    { id: "siswa_dinda", nama: "Dinda Amelia", nisn: "0051234562" },
    { id: "siswa_bima", nama: "Bima Nugraha", nisn: "0051234563" },
    { id: "siswa_citra", nama: "Citra Ayu", nisn: "0051234564" },
  ].map((s) => ({ ...s, peran: "siswa", identifier: s.nisn, password: "siswa123" }));

  const users = [guru1, guru2, admin1, ...siswaSeed].map((user) => ({
    ...user,
    dibuatAt: user.dibuatAt || dibuat,
    jumlahLogin: user.jumlahLogin || 0,
    terakhirLogin: user.terakhirLogin || null,
  }));

  const kelas8a = {
    id: "kelas_8a_mtk", nama: "VIII-A", mapel: "Matematika", guruId: guru1.id,
    kodeKelas: "MTK8A1", siswaIds: ["siswa_raka", "siswa_dinda", "siswa_bima"],
  };
  const kelas9a = {
    id: "kelas_9a_ipa", nama: "IX-A", mapel: "IPA", guruId: guru2.id,
    kodeKelas: "IPA9A1", siswaIds: ["siswa_raka", "siswa_citra"],
  };
  const kelasList = [kelas8a, kelas9a];

  const materi = [
    { id: uid("materi"), kelasId: kelas8a.id, judul: "Pengantar Pecahan", tipe: "catatan", isi: "Pecahan adalah bagian dari keseluruhan. Contoh: 1/2, 3/4.", tanggal: nowISO() },
    { id: uid("materi"), kelasId: kelas8a.id, judul: "Video: Operasi Pecahan", tipe: "video", isi: "https://www.youtube.com/watch?v=contoh", tanggal: nowISO() },
    { id: uid("materi"), kelasId: kelas9a.id, judul: "Modul Sistem Pencernaan", tipe: "tautan", isi: "https://contoh-materi.sekolah.sch.id/pencernaan.pdf", tanggal: nowISO() },
  ];

  const besok = new Date(Date.now() + 86400000).toISOString();
  const tugas = [
    { id: "tugas_pecahan", kelasId: kelas8a.id, judul: "Laporan Bab Pecahan", deskripsi: "Kerjakan latihan 1-10 halaman 24, foto/scan atau ketik jawaban.", tenggat: besok },
    { id: "tugas_pencernaan", kelasId: kelas9a.id, judul: "Ringkasan Sistem Pencernaan", deskripsi: "Buat ringkasan maksimal 2 halaman.", tenggat: besok },
  ];

  const pengumpulan = [
    { id: uid("kumpul"), tugasId: "tugas_pecahan", siswaId: "siswa_dinda", isi: "Jawaban terlampir di tautan drive.", waktuKumpul: nowISO(), status: "tepat", nilai: 88, feedback: "Bagus, rapi." },
  ];

  const kuis = [
    {
      id: "kuis_pecahan", kelasId: kelas8a.id, judul: "Kuis Pecahan Dasar", durasiMenit: 15,
      soal: [
        { id: "s1", teks: "1/2 + 1/4 = ?", pilihan: ["1/6", "2/6", "3/4", "1/4"], jawabanBenar: 2 },
        { id: "s2", teks: "3/4 dari 20 adalah?", pilihan: ["10", "12", "15", "18"], jawabanBenar: 2 },
        { id: "s3", teks: "Bentuk paling sederhana dari 4/8 adalah?", pilihan: ["1/2", "2/4", "4/8", "1/4"], jawabanBenar: 0 },
      ],
    },
  ];

  const hasilKuis = [];

  const forum = [
    {
      id: uid("forum"), kelasId: kelas8a.id, judul: "Cara mengubah pecahan campuran ke biasa?", penulisId: "siswa_raka",
      isi: "Aku masih bingung caranya, ada yang bisa jelaskan?", waktu: nowISO(),
      balasan: [
        { id: uid("balas"), penulisId: guru1.id, isi: "Kalikan bilangan bulat dengan penyebut, lalu tambahkan pembilang.", waktu: nowISO() },
      ],
    },
  ];

  const liveClass = [
    { id: uid("live"), kelasId: kelas8a.id, judul: "Live Class: Bangun Ruang", waktu: besok, tautan: "https://meet.contoh/kelas-8a", rekamanUrl: "", hadir: [] },
  ];

  const absensi = [];

  const data = { users, kelas: kelasList, materi, tugas, pengumpulan, kuis, hasilKuis, forum, liveClass, absensi };
  localStorage.setItem(DB_KEY, JSON.stringify(data));
  return data;
}

function readDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) return seedData();
  try {
    return JSON.parse(raw);
  } catch {
    return seedData();
  }
}

function writeDB(data) {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}

export function resetDemoData() {
  seedData();
}

// Auth
export function login(identifier, password) {
  const db = readDB();
  if (!identifier || !password) return null;
  const user = db.users.find(
    (u) => u.identifier.toLowerCase() === identifier.trim().toLowerCase() && u.password === password
  );
  if (!user) return null;
  user.jumlahLogin = (user.jumlahLogin || 0) + 1;
  user.terakhirLogin = nowISO();
  writeDB(db);
  const { password: ignored, ...safeUser } = user;
  return safeUser;
}

export function registerSiswa({ nama, nisn, password, kodeKelas }) {
  const db = readDB();
  const cleanNama = (nama || "").trim();
  const cleanNisn = (nisn || "").trim();
  const cleanPassword = password || "";
  const cleanKodeKelas = (kodeKelas || "").trim();
  if (!cleanNama || !cleanNisn || cleanPassword.length < 6 || !cleanKodeKelas) {
    throw new Error("Nama, NISN, kata sandi minimal 6 karakter, dan kode kelas wajib diisi.");
  }
  if (db.users.some((u) => u.identifier.toLowerCase() === cleanNisn.toLowerCase())) {
    throw new Error("NISN ini sudah terdaftar. Coba masuk (login) langsung.");
  }
  const kelas = db.kelas.find((k) => k.kodeKelas.toLowerCase() === cleanKodeKelas.toLowerCase());
  if (!kelas) throw new Error("Kode kelas tidak ditemukan. Periksa kembali kode dari gurumu.");

  const newUser = { id: uid("siswa"), nama: cleanNama, peran: "siswa", identifier: cleanNisn, password: cleanPassword, nisn: cleanNisn, dibuatAt: nowISO(), jumlahLogin: 0, terakhirLogin: null };
  db.users.push(newUser);
  kelas.siswaIds.push(newUser.id);
  writeDB(db);
  return { ...newUser, password: undefined };
}

// Kelas
export function getKelasForGuru(guruId) {
  const db = readDB();
  return db.kelas.filter((k) => k.guruId === guruId);
}

export function getKelasForSiswa(siswaId) {
  const db = readDB();
  return db.kelas.filter((k) => k.siswaIds.includes(siswaId));
}

export function getAllKelas() {
  return readDB().kelas;
}

export function getKelasById(kelasId) {
  const db = readDB();
  return db.kelas.find((k) => k.id === kelasId) || null;
}

export function createKelas(guruId, { nama, mapel }) {
  const db = readDB();
  const kode = (nama.replace(/[^a-zA-Z0-9]/g, "") + Math.floor(100 + Math.random() * 900)).toUpperCase();
  const kelasBaru = { id: uid("kelas"), nama, mapel, guruId, kodeKelas: kode, siswaIds: [] };
  db.kelas.push(kelasBaru);
  writeDB(db);
  return kelasBaru;
}

export function getSiswaByIds(ids) {
  const db = readDB();
  return db.users.filter((u) => ids.includes(u.id));
}

export function keluarkanSiswaDariKelas(kelasId, siswaId) {
  const db = readDB();
  const kelas = db.kelas.find((k) => k.id === kelasId);
  if (kelas) kelas.siswaIds = kelas.siswaIds.filter((id) => id !== siswaId);
  writeDB(db);
}

// Materi
export function getMateriByKelas(kelasId) {
  const db = readDB();
  return db.materi.filter((m) => m.kelasId === kelasId).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
}

export function addMateri(kelasId, { judul, tipe, isi }) {
  const db = readDB();
  const item = { id: uid("materi"), kelasId, judul, tipe, isi, tanggal: nowISO() };
  db.materi.push(item);
  writeDB(db);
  return item;
}

// Tugas & Penilaian
export function getTugasByKelas(kelasId) {
  const db = readDB();
  return db.tugas.filter((t) => t.kelasId === kelasId).sort((a, b) => new Date(a.tenggat) - new Date(b.tenggat));
}

export function addTugas(kelasId, { judul, deskripsi, tenggat }) {
  const db = readDB();
  const item = { id: uid("tugas"), kelasId, judul, deskripsi, tenggat };
  db.tugas.push(item);
  writeDB(db);
  return item;
}

export function getPengumpulanForTugas(tugasId) {
  const db = readDB();
  return db.pengumpulan.filter((p) => p.tugasId === tugasId);
}

export function getPengumpulanSiswa(tugasId, siswaId) {
  const db = readDB();
  return db.pengumpulan.find((p) => p.tugasId === tugasId && p.siswaId === siswaId) || null;
}

export function submitTugas(tugasId, siswaId, isi) {
  const db = readDB();
  const tugas = db.tugas.find((t) => t.id === tugasId);
  const terlambat = tugas ? new Date() > new Date(tugas.tenggat) : false;
  const existing = db.pengumpulan.find((p) => p.tugasId === tugasId && p.siswaId === siswaId);
  if (existing) {
    existing.isi = isi;
    existing.waktuKumpul = nowISO();
    existing.status = terlambat ? "terlambat" : "tepat";
  } else {
    db.pengumpulan.push({
      id: uid("kumpul"), tugasId, siswaId, isi,
      waktuKumpul: nowISO(), status: terlambat ? "terlambat" : "tepat",
      nilai: null, feedback: "",
    });
  }
  writeDB(db);
}

export function gradeTugas(pengumpulanId, nilai, feedback) {
  const db = readDB();
  const p = db.pengumpulan.find((x) => x.id === pengumpulanId);
  if (p) {
    p.nilai = Number(nilai);
    p.feedback = feedback;
  }
  writeDB(db);
}

// Kuis & Ujian
export function getKuisByKelas(kelasId) {
  const db = readDB();
  return db.kuis.filter((k) => k.kelasId === kelasId);
}

export function addKuis(kelasId, { judul, durasiMenit, soal }) {
  const db = readDB();
  const item = { id: uid("kuis"), kelasId, judul, durasiMenit, soal };
  db.kuis.push(item);
  writeDB(db);
  return item;
}

export function getHasilKuisSiswa(kuisId, siswaId) {
  const db = readDB();
  return db.hasilKuis.find((h) => h.kuisId === kuisId && h.siswaId === siswaId) || null;
}

export function getHasilKuisByKuis(kuisId) {
  const db = readDB();
  return db.hasilKuis.filter((h) => h.kuisId === kuisId);
}

export function submitHasilKuis(kuisId, siswaId, jawaban, waktuMulai) {
  const db = readDB();
  const kuis = db.kuis.find((k) => k.id === kuisId);
  if (!kuis || !Array.isArray(kuis.soal) || kuis.soal.length === 0) {
    throw new Error("Kuis tidak ditemukan atau belum memiliki soal.");
  }
  if (!jawaban || Object.keys(jawaban).length !== kuis.soal.length) {
    throw new Error("Jawab semua soal sebelum mengirim kuis.");
  }
  let benar = 0;
  kuis.soal.forEach((s, idx) => {
    if (jawaban[idx] === s.jawabanBenar) benar += 1;
  });
  const skor = Math.round((benar / kuis.soal.length) * 100);
  const hasil = {
    id: uid("hasilkuis"), kuisId, siswaId, jawaban, skor,
    waktuMulai, waktuSelesai: nowISO(),
  };
  db.hasilKuis.push(hasil);
  writeDB(db);
  return hasil;
}

// Forum
export function getForumByKelas(kelasId) {
  const db = readDB();
  return db.forum.filter((f) => f.kelasId === kelasId).sort((a, b) => new Date(b.waktu) - new Date(a.waktu));
}

export function addForumTopik(kelasId, { judul, isi, penulisId }) {
  const db = readDB();
  const topik = { id: uid("forum"), kelasId, judul, isi, penulisId, waktu: nowISO(), balasan: [] };
  db.forum.push(topik);
  writeDB(db);
  return topik;
}

export function addForumBalasan(topikId, { isi, penulisId }) {
  const db = readDB();
  const topik = db.forum.find((f) => f.id === topikId);
  if (topik) topik.balasan.push({ id: uid("balas"), isi, penulisId, waktu: nowISO() });
  writeDB(db);
}

// Live Class
export function getLiveClassByKelas(kelasId) {
  const db = readDB();
  return db.liveClass.filter((l) => l.kelasId === kelasId).sort((a, b) => new Date(a.waktu) - new Date(b.waktu));
}

export function addLiveClass(kelasId, { judul, waktu, tautan }) {
  const db = readDB();
  const item = { id: uid("live"), kelasId, judul, waktu, tautan, rekamanUrl: "", hadir: [] };
  db.liveClass.push(item);
  writeDB(db);
  return item;
}

export function joinLiveClass(liveId, siswaId) {
  const db = readDB();
  const live = db.liveClass.find((l) => l.id === liveId);
  if (live && !live.hadir.includes(siswaId)) {
    live.hadir.push(siswaId);
    db.absensi.push({ id: uid("absen"), kelasId: live.kelasId, siswaId, tanggal: nowISO(), status: "hadir", sumber: `Live: ${live.judul}` });
  }
  writeDB(db);
}

export function getAbsensiByKelas(kelasId) {
  const db = readDB();
  return db.absensi.filter((a) => a.kelasId === kelasId);
}

// Rekap Nilai
export function getRekapNilaiSiswa(siswaId) {
  const db = readDB();
  const kelasSiswa = db.kelas.filter((k) => k.siswaIds.includes(siswaId));

  return kelasSiswa.map((kelas) => {
    const tugasKelas = db.tugas.filter((t) => t.kelasId === kelas.id);
    const nilaiTugas = tugasKelas
      .map((t) => {
        const p = db.pengumpulan.find((x) => x.tugasId === t.id && x.siswaId === siswaId);
        return p && p.nilai != null ? { judul: t.judul, nilai: p.nilai, jenis: "Tugas" } : null;
      })
      .filter(Boolean);

    const kuisKelas = db.kuis.filter((k) => k.kelasId === kelas.id);
    const nilaiKuis = kuisKelas
      .map((k) => {
        const h = db.hasilKuis.find((x) => x.kuisId === k.id && x.siswaId === siswaId);
        return h ? { judul: k.judul, nilai: h.skor, jenis: "Kuis" } : null;
      })
      .filter(Boolean);

    const semuaNilai = [...nilaiTugas, ...nilaiKuis];
    const rataRata = semuaNilai.length
      ? Math.round(semuaNilai.reduce((sum, n) => sum + n.nilai, 0) / semuaNilai.length)
      : null;

    return { kelas, rincian: semuaNilai, rataRata };
  });
}

export function getUserById(id) {
  const db = readDB();
  return db.users.find((u) => u.id === id) || null;
}

export function getAllUsers() {
  return readDB().users.map(({ password, ...user }) => user);
}

export function exportAccountData() {
  return JSON.stringify({
    version: 1,
    exportedAt: nowISO(),
    description: "Data akun Kelasku tanpa password.",
    accounts: getAllUsers(),
  }, null, 2);
}

export function createUserByAdmin({ nama, identifier, password, peran, mapel = "", kelasId = "" }) {
  const db = readDB();
  const cleanNama = (nama || "").trim();
  const cleanIdentifier = (identifier || "").trim().toLowerCase();
  if (!cleanNama || !cleanIdentifier || !password || password.length < 6) {
    throw new Error("Nama, identitas, dan kata sandi minimal 6 karakter wajib diisi.");
  }
  if (!["siswa", "guru", "admin"].includes(peran)) throw new Error("Peran akun tidak valid.");
  if (db.users.some((user) => user.identifier.toLowerCase() === cleanIdentifier)) {
    throw new Error("Identitas tersebut sudah terdaftar.");
  }
  const user = { id: uid(peran), nama: cleanNama, peran, identifier: cleanIdentifier, password, dibuatAt: nowISO(), jumlahLogin: 0, terakhirLogin: null };
  if (peran === "siswa") user.nisn = cleanIdentifier;
  if (peran === "guru") user.mapel = (mapel || "").trim() || "Umum";
  if (peran === "siswa") {
    const kelas = db.kelas.find((item) => item.id === kelasId);
    if (!kelas) throw new Error("Pilih kelas untuk akun siswa.");
    user.kelasId = kelas.id;
    kelas.siswaIds.push(user.id);
  }
  db.users.push(user);
  writeDB(db);
  const { password: ignored, ...safeUser } = user;
  return safeUser;
}