import React, { useState, useMemo, useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import * as db from "./Db.js";
import { useAuth } from "./Authcontext.jsx";
import DashboardGuru from "./GuruDashboardView.jsx";
import DashboardSiswa from "./SiswaDashboardView.jsx";

const sections = [
  ["ringkasan", "Ringkasan"],
  ["kelas", "Kelas"],
  ["tugas", "Tugas"],
  ["kuis", "Kuis"],
  ["forum", "Forum"],
  ["live", "Live class"],
  ["nilai", "Nilai & rapor"],
  ["akun", "Kelola akun"],
];

function formatDate(value) {
  return new Date(value).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

export default function LearningPage() {
  const { section = "ringkasan" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [version, setVersion] = useState(0);
  const [kelasId, setKelasId] = useState("");
  const [notice, setNotice] = useState(null);
  const kelas = user?.peran === "guru" ? db.getKelasForGuru(user.id) : user?.peran === "admin" ? db.getAllKelas() : db.getKelasForSiswa(user.id);
  const activeKelasId = kelas.some((item) => item.id === kelasId) ? kelasId : kelas[0]?.id || "";
  const activeKelas = db.getKelasById(activeKelasId);

  function refresh(message, type = "success") {
    setVersion((value) => value + 1);
    if (message) setNotice({ type, message });
  }

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(null), 3600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  // Data untuk dashboard guru
  const guruData = useMemo(() => {
    if (user?.peran !== "guru") return null;
    const kelasSaya = db.getKelasForGuru(user.id).map((k) => ({
      id: k.id,
      nama: `${k.nama} · ${k.mapel}`,
      siswa: k.siswaIds.length,
      tugasBelumDinilai: db.getTugasByKelas(k.id)
        .filter((t) => db.getPengumpulanForTugas(t.id).some((p) => p.nilai === null || p.nilai === undefined))
        .length,
    }));
    const tugasPerluDinilai = db.getTugasByKelas(activeKelasId).map((t) => {
      const pengumpulan = db.getPengumpulanForTugas(t.id);
      return {
        id: t.id,
        judul: t.judul,
        kelas: activeKelas?.nama || "",
        sudahMasuk: pengumpulan.length,
        total: activeKelas?.siswaIds.length || 0,
      };
    });
    const jadwalLive = db.getLiveClassByKelas(activeKelasId).map((l) => ({
      id: l.id,
      kelas: activeKelas?.nama || "",
      judul: l.judul,
      waktu: formatDate(l.waktu),
      status: "Terjadwal",
    }));
    return { kelasSaya, tugasPerluDinilai, jadwalLive };
  }, [user, activeKelasId, version]);

  // Data untuk dashboard siswa
  const siswaData = useMemo(() => {
    if (user?.peran !== "siswa") return null;
    const tugasAktif = db.getTugasByKelas(activeKelasId).map((t) => {
      const pengumpulan = db.getPengumpulanSiswa(t.id, user.id);
      const status = pengumpulan ? "terkumpul" : (new Date(t.tenggat) < new Date() ? "terlambat" : "belum");
      const statusLabel = status === "terlambat" ? "Terlambat" : status === "terkumpul" ? "Terkumpul" : "Belum dikumpulkan";
      return {
        id: t.id,
        judul: t.judul,
        mapel: activeKelas?.mapel || "",
        tenggat: formatDate(t.tenggat),
        status: status === "terlambat" ? "terlambat" : status,
        label: statusLabel,
      };
    });
    const ulanganMendatang = db.getKuisByKelas(activeKelasId).map((k) => ({
      id: k.id,
      judul: k.judul,
      mapel: activeKelas?.mapel || "",
      waktu: formatDate(new Date(Date.now() + 86400000)),
      durasi: `${k.durasiMenit} menit`,
    }));
    const nilaiTerbaru = db.getRekapNilaiSiswa(user.id)
      .filter((r) => r.kelas.id === activeKelasId)
      .flatMap((r) => r.rincian.map((n) => ({ ...n, mapel: r.kelas.mapel })))
      .slice(0, 5);
    return { tugasAktif, ulanganMendatang, nilaiTerbaru };
  }, [user, activeKelasId, version]);

  if (!sections.some(([id]) => id === section)) {
    const base = user?.peran === "guru" ? "/guru" : user?.peran === "admin" ? "/admin" : "/siswa";
    return <Navigate to={`${base}/ringkasan`} replace />;
  }

  // Navigasi dari dashboard
  const handleNavigate = (path) => {
    // path seperti "/guru/tugas", kita ambil bagian terakhir sebagai section
    const parts = path.split("/");
    const section = parts[parts.length - 1];
    // jika section valid, kita arahkan ke halaman tersebut
    if (sections.some(([id]) => id === section)) {
      const base = user?.peran === "guru" ? "/guru" : user?.peran === "admin" ? "/admin" : "/siswa";
      navigate(`${base}/${section}`);
    }
  };

  return (
    <div className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">{user?.peran === "guru" ? "Ruang kerja guru" : user?.peran === "admin" ? "Panel sekolah" : "Ruang belajar siswa"}</p>
          <h1>{sections.find(([id]) => id === section)?.[1] || "Ruang belajar"}</h1>
        </div>
        {kelas.length > 0 && section !== "ringkasan" && (
          <label className="class-picker">Kelas aktif
            <select value={activeKelasId} onChange={(event) => setKelasId(event.target.value)}>
              {kelas.map((item) => <option key={item.id} value={item.id}>{item.nama} · {item.mapel}</option>)}
            </select>
          </label>
        )}
      </header>
      {notice && <div className={`toast toast-${notice.type}`} role="status">{notice.message}</div>}
      <div className="workspace-content">
        {section === "ringkasan" && (
          <>
            {user?.peran === "guru" && guruData && (
              <DashboardGuru 
                namaGuru={user.nama} 
                kelasSaya={guruData.kelasSaya} 
                tugasPerluDinilai={guruData.tugasPerluDinilai} 
                jadwalLive={guruData.jadwalLive}
                onNavigate={handleNavigate}
              />
            )}
            {user?.peran === "siswa" && siswaData && (
              <DashboardSiswa 
                namaSiswa={user.nama} 
                tugasAktif={siswaData.tugasAktif} 
                ulanganMendatang={siswaData.ulanganMendatang} 
                nilaiTerbaru={siswaData.nilaiTerbaru}
                onNavigate={handleNavigate}
              />
            )}
            {user?.peran === "admin" && (
              <AdminSummary />
            )}
          </>
        )}
        {user?.peran === "admin" && section !== "ringkasan" && section !== "akun" && <AdminModule section={section} onRefresh={refresh} />}
        {user?.peran !== "admin" && section === "kelas" && <Classes user={user} kelas={kelas} activeKelas={activeKelas} onRefresh={refresh} />}
        {user?.peran !== "admin" && section === "tugas" && <Tasks user={user} kelas={kelas} activeKelas={activeKelas} onRefresh={refresh} />}
        {user?.peran !== "admin" && section === "kuis" && <Quizzes user={user} kelas={kelas} activeKelas={activeKelas} onRefresh={refresh} />}
        {user?.peran !== "admin" && section === "forum" && <Forum user={user} activeKelas={activeKelas} onRefresh={refresh} />}
        {user?.peran !== "admin" && section === "live" && <LiveClasses user={user} activeKelas={activeKelas} onRefresh={refresh} />}
        {user?.peran !== "admin" && section === "nilai" && <Grades user={user} />}
        {section === "akun" && <Accounts user={user} onRefresh={refresh} />}
      </div>
      <span className="sr-only" key={version}>Data diperbarui</span>
    </div>
  );
}

function Panel({ title, children }) {
  return <section className="card panel"><h2>{title}</h2>{children}</section>;
}

function Field({ label, value, onChange, placeholder = "" }) {
  return <label className="field">{label}<input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Empty({ text }) { return text ? <p className="empty-state">{text}</p> : null; }

function AdminSummary() {
  const summary = db.getSystemSummary();
  const stats = [
    ["Pengguna", summary.users, "akun terdaftar"],
    ["Siswa", summary.students, "akun siswa"],
    ["Guru", summary.teachers, "akun guru"],
    ["Kelas", summary.classes, "rombel aktif"],
  ];
  const activity = [
    ["Materi pelajaran", summary.materials],
    ["Tugas diterbitkan", summary.assignments],
    ["Pengumpulan tugas", summary.submissions],
    ["Menunggu penilaian", summary.pendingGrading],
    ["Kuis tersedia", summary.quizzes],
    ["Pengerjaan kuis", summary.quizAttempts],
    ["Topik forum", summary.forumTopics],
    ["Live class", summary.liveClasses],
    ["Catatan kehadiran", summary.attendance],
  ];
  return (
    <div className="admin-overview">
      <section className="card admin-welcome">
        <div>
          <p className="eyebrow">Pusat kendali sekolah</p>
          <h2>Ringkasan sistem Kelasku</h2>
          <p>Kelola akun dan pantau aktivitas pembelajaran dari satu tempat. Angka berikut diperbarui dari data demo lokal saat halaman dibuka.</p>
        </div>
        <span className="badge badge-teal">Sistem aktif</span>
      </section>

      <div className="stats-grid">
        {stats.map(([label, value, detail], index) => (
          <section className="card stat" key={label} style={{ borderTopColor: ["var(--teal)", "var(--yellow)", "var(--coral)", "var(--violet)"][index] }}>
            <strong>{value}</strong>
            <span>{label}</span>
            <small>{detail}</small>
          </section>
        ))}
      </div>

      <div className="two-column admin-overview-grid">
        <section className="card panel">
          <h2>Aktivitas pembelajaran</h2>
          <div className="admin-metric-list">
            {activity.map(([label, value]) => (
              <div className="admin-metric" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="card panel">
          <h2>Fitur pengumpulan tugas</h2>
          <div className="admin-feature-list">
            <div><span className="admin-feature-icon">↗</span><div><strong>Link</strong><small>Pengumpulan melalui URL eksternal</small></div></div>
            <div><span className="admin-feature-icon">▣</span><div><strong>Dokumen & foto</strong><small>File lokal maksimal 5 MB</small></div></div>
            <div><span className="admin-feature-icon">◈</span><div><strong>Google Drive</strong><small>{summary.driveSubmissions} tautan Drive tersimpan</small></div></div>
          </div>
          <div className="admin-note">File demo tersimpan di penyimpanan browser perangkat ini.</div>
        </section>
      </div>

      <section className="card admin-system-note">
        <div>
          <h2>Modul yang tersedia</h2>
          <p>Kelas, materi, tugas dan penilaian, kuis otomatis, forum diskusi, live class, absensi, nilai/rapor, serta kelola akun.</p>
        </div>
        <div className="admin-status-list">
          <span><i />Autentikasi demo aktif</span>
          <span><i />Data tersimpan lokal</span>
          <span><i />Export akun tanpa password</span>
        </div>
      </section>
    </div>
  );
}

function AdminModule({ section, onRefresh }) {
  const classes = db.getAllKelas();
  const users = db.getAllUsers();
  if (section === "kelas") {
    const teachers = users.filter((user) => user.peran === "guru");
    return <AdminClasses classes={classes} teachers={teachers} onRefresh={onRefresh} />;
  }
  if (section === "tugas") {
    const tasks = classes.flatMap((item) => db.getTugasByKelas(item.id).map((task) => ({ ...task, kelas: item.nama })));
    return <AdminTasks classes={classes} tasks={tasks} onRefresh={onRefresh} />;
  }
  if (section === "kuis") {
    const quizzes = classes.flatMap((item) => db.getKuisByKelas(item.id).map((quiz) => ({ ...quiz, kelas: item.nama })));
    return <Panel title="Monitoring kuis">{quizzes.map((quiz) => <div className="list-row" key={quiz.id}><div><strong>{quiz.judul}</strong><small>{quiz.kelas} · {quiz.soal.length} soal · {quiz.durasiMenit} menit</small></div><div className="row-actions"><span className="badge badge-teal">{db.getHasilKuisByKuis(quiz.id).length} pengerjaan</span><button className="btn btn-danger" onClick={() => { if (window.confirm("Hapus kuis ini?")) { db.deleteKuis(quiz.id); onRefresh("Kuis berhasil dihapus."); } }}>Hapus</button></div></div>)}<Empty text={!quizzes.length ? "Belum ada kuis tersedia." : ""} /></Panel>;
  }
  if (section === "forum") {
    const topics = classes.flatMap((item) => db.getForumByKelas(item.id).map((topic) => ({ ...topic, kelas: item.nama })));
    return <Panel title="Aktivitas forum">{topics.map((topic) => <div className="list-row" key={topic.id}><div><strong>{topic.judul}</strong><small>{topic.kelas} · {formatDate(topic.waktu)} · {topic.balasan.length} balasan</small><p>{topic.isi}</p></div><button className="btn btn-danger" onClick={() => { if (window.confirm("Hapus topik ini?")) { db.deleteForumTopik(topic.id); onRefresh("Topik forum berhasil dihapus."); } }}>Hapus</button></div>)}<Empty text={!topics.length ? "Belum ada diskusi forum." : ""} /></Panel>;
  }
  if (section === "live") {
    const lives = classes.flatMap((item) => db.getLiveClassByKelas(item.id).map((live) => ({ ...live, kelas: item.nama })));
    return <Panel title="Jadwal live class sekolah">{lives.map((live) => <div className="list-row" key={live.id}><div><strong>{live.judul}</strong><small>{live.kelas} · {formatDate(live.waktu)} · {live.hadir.length} hadir</small></div><div className="row-actions"><a className="btn btn-ghost" href={live.tautan} target="_blank" rel="noreferrer">Buka</a><button className="btn btn-danger" onClick={() => { if (window.confirm("Hapus jadwal ini?")) { db.deleteLiveClass(live.id); onRefresh("Live class berhasil dihapus."); } }}>Hapus</button></div></div>)}<Empty text={!lives.length ? "Belum ada live class terjadwal." : ""} /></Panel>;
  }
  const students = users.filter((user) => user.peran === "siswa");
  return <Panel title="Rekap nilai siswa">{students.map((student) => { const records = db.getRekapNilaiSiswa(student.id); const values = records.flatMap((record) => record.rincian.map((item) => item.nilai)); const average = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null; return <div className="list-row" key={student.id}><div><strong>{student.nama}</strong><small>{student.identifier} · {values.length} penilaian</small></div><strong>{average ?? "-"}</strong></div>; })}<Empty text={!students.length ? "Belum ada akun siswa." : ""} /></Panel>;
}

function AdminClasses({ classes, teachers, onRefresh }) {
  const [form, setForm] = useState({ nama: "", mapel: "", guruId: "" });
  function createClass(event) {
    event.preventDefault();
    try {
      db.createKelas(form.guruId, form);
      setForm({ nama: "", mapel: "", guruId: "" });
      onRefresh("Kelas berhasil ditambahkan.");
    } catch (error) {
      onRefresh(error.message, "error");
    }
  }
  return <div className="two-column">
    <Panel title="Semua kelas dan rombel">{classes.map((item) => { const teacher = teachers.find((user) => user.id === item.guruId); return <div className="list-row" key={item.id}><div><strong>{item.nama} · {item.mapel}</strong><small>Kode {item.kodeKelas} · Pengajar: {teacher?.nama || "Belum ditentukan"} · {item.siswaIds.length} siswa</small></div><div className="row-actions"><span className="badge badge-teal">Aktif</span><button className="btn btn-danger" onClick={() => { if (window.confirm("Hapus kelas beserta data terkait?")) { db.deleteKelas(item.id); onRefresh("Kelas dan data terkait berhasil dihapus."); } }}>Hapus</button></div></div>; })}<Empty text={!classes.length ? "Belum ada kelas yang terdaftar." : ""} /></Panel>
    <Panel title="Tambahkan kelas"><form className="stack-form" onSubmit={createClass}><Field label="Nama rombel" value={form.nama} onChange={(value) => setForm({ ...form, nama: value })} placeholder="Contoh: XI-RPL 1" /><Field label="Mata pelajaran" value={form.mapel} onChange={(value) => setForm({ ...form, mapel: value })} placeholder="Contoh: Pemrograman Web" /><label className="field">Guru pengampu<select required value={form.guruId} onChange={(event) => setForm({ ...form, guruId: event.target.value })}><option value="">Pilih guru</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.nama} · {teacher.mapel || "Umum"}</option>)}</select></label><button className="btn btn-teal">Tambahkan kelas</button></form>{!teachers.length && <Empty text="Tambahkan akun guru terlebih dahulu sebelum membuat kelas." />}</Panel>
  </div>;
}

function AdminTasks({ classes, tasks, onRefresh }) {
  const [form, setForm] = useState({ kelasId: classes[0]?.id || "", judul: "", deskripsi: "", tenggat: "" });
  function create(event) {
    event.preventDefault();
    try { db.addTugas(form.kelasId, form); setForm({ ...form, judul: "", deskripsi: "", tenggat: "" }); onRefresh("Tugas berhasil ditambahkan."); } catch (error) { onRefresh(error.message, "error"); }
  }
  return <div className="two-column"><Panel title="Monitoring tugas sekolah">{tasks.map((task) => { const submissions = db.getPengumpulanForTugas(task.id); const graded = submissions.filter((item) => item.nilai != null).length; return <div className="list-row" key={task.id}><div><strong>{task.judul}</strong><small>{task.kelas} · Tenggat {formatDate(task.tenggat)}</small></div><div className="row-actions"><span className="badge badge-yellow">{graded}/{submissions.length} dinilai</span><button className="btn btn-danger" onClick={() => { if (window.confirm("Hapus tugas dan pengumpulannya?")) { db.deleteTugas(task.id); onRefresh("Tugas berhasil dihapus."); } }}>Hapus</button></div></div>; })}<Empty text={!tasks.length ? "Belum ada tugas diterbitkan." : ""} /></Panel><Panel title="Tambahkan tugas"><form className="stack-form" onSubmit={create}><label className="field">Kelas<select required value={form.kelasId} onChange={(event) => setForm({ ...form, kelasId: event.target.value })}>{classes.map((item) => <option key={item.id} value={item.id}>{item.nama} · {item.mapel}</option>)}</select></label><Field label="Judul tugas" value={form.judul} onChange={(value) => setForm({ ...form, judul: value })} /><label className="field">Deskripsi<textarea value={form.deskripsi} onChange={(event) => setForm({ ...form, deskripsi: event.target.value })} /></label><label className="field">Tenggat<input required type="datetime-local" value={form.tenggat} onChange={(event) => setForm({ ...form, tenggat: event.target.value })} /></label><button className="btn btn-teal" disabled={!classes.length}>Tambahkan tugas</button></form></Panel></div>;
}

function Classes({ user, kelas, activeKelas, onRefresh }) {
  const [classForm, setClassForm] = useState({ nama: "", mapel: "" });
  const [materialForm, setMaterialForm] = useState({ judul: "", tipe: "catatan", isi: "" });
  function createClass(event) {
    event.preventDefault();
    if (!classForm.nama.trim() || !classForm.mapel.trim()) return;
    db.createKelas(user.id, classForm);
    setClassForm({ nama: "", mapel: "" });
    onRefresh("Kelas berhasil dibuat.");
  }
  function createMaterial(event) {
    event.preventDefault();
    if (!activeKelas || !materialForm.judul.trim() || !materialForm.isi.trim()) return;
    db.addMateri(activeKelas.id, materialForm);
    setMaterialForm({ judul: "", tipe: "catatan", isi: "" });
    onRefresh("Materi berhasil ditambahkan.");
  }
  return <div className="two-column">
    <Panel title="Kelas yang tersedia">{kelas.map((item) => <div className="list-row" key={item.id}><div><strong>{item.nama}</strong><small>{item.mapel} · {item.siswaIds.length} siswa · kode {item.kodeKelas}</small></div><span className="badge badge-teal">Aktif</span></div>)}{!kelas.length && <Empty text="Belum ada kelas." />}</Panel>
    {user.peran === "guru" ? <Panel title="Buat kelas"><form className="stack-form" onSubmit={createClass}><Field label="Nama rombel" value={classForm.nama} onChange={(value) => setClassForm({ ...classForm, nama: value })} placeholder="Contoh: XI-RPL 1" /><Field label="Mata pelajaran" value={classForm.mapel} onChange={(value) => setClassForm({ ...classForm, mapel: value })} /><button className="btn btn-teal">Buat kelas</button></form></Panel> : <Panel title={`Materi ${activeKelas?.nama || ""}`}>{activeKelas && db.getMateriByKelas(activeKelas.id).map((item) => <div className="list-row" key={item.id}><div><strong>{item.judul}</strong><small>{item.tipe} · {formatDate(item.tanggal)}</small><p>{item.isi}</p></div></div>)}{activeKelas && !db.getMateriByKelas(activeKelas.id).length && <Empty text="Belum ada materi." />}</Panel>}
    {user.peran === "guru" && activeKelas && <Panel title={`Tambah materi ke ${activeKelas.nama}`}><form className="stack-form" onSubmit={createMaterial}><Field label="Judul" value={materialForm.judul} onChange={(value) => setMaterialForm({ ...materialForm, judul: value })} /><label className="field">Jenis<select value={materialForm.tipe} onChange={(event) => setMaterialForm({ ...materialForm, tipe: event.target.value })}><option value="catatan">Catatan</option><option value="tautan">Tautan</option><option value="video">Video</option></select></label><label className="field">Isi atau URL<textarea value={materialForm.isi} onChange={(event) => setMaterialForm({ ...materialForm, isi: event.target.value })} /></label><button className="btn btn-teal">Simpan materi</button></form></Panel>}
  </div>;
}

function Tasks({ user, activeKelas, onRefresh }) {
  const [form, setForm] = useState({ judul: "", deskripsi: "", tenggat: "" });
  const [answers, setAnswers] = useState({});
  const [gradeForms, setGradeForms] = useState({});
  const tasks = activeKelas ? db.getTugasByKelas(activeKelas.id) : [];
  function createTask(event) {
    event.preventDefault();
    if (!activeKelas || !form.judul.trim() || !form.tenggat) return;
    try {
      db.addTugas(activeKelas.id, form);
    } catch (error) {
      onRefresh(error.message, "error");
      return;
    }
    setForm({ judul: "", deskripsi: "", tenggat: "" });
    onRefresh("Tugas berhasil dibuat.");
  }
  function updateAnswer(taskId, field, value) {
    setAnswers({ ...answers, [taskId]: { ...(answers[taskId] || { tipe: "link" }), [field]: value } });
  }
  function submitTask(task) {
    const answer = answers[task.id] || {};
    const currentSubmission = db.getPengumpulanSiswa(task.id, user.id);
    const data = {
      tipe: answer.tipe || currentSubmission?.tipe || "link",
      isi: (answer.isi || "").trim(),
      driveUrl: (answer.driveUrl || "").trim(),
      file: answer.file || currentSubmission?.file || null,
    };
    const needsFile = data.tipe === "dokumen" || data.tipe === "foto";
    if (data.tipe !== "gdrive") data.driveUrl = "";
    if (!needsFile) data.file = null;
    const value = data.tipe === "gdrive" ? data.driveUrl : needsFile ? data.file : data.isi;
    if (!value) {
      onRefresh(data.tipe === "gdrive" ? "Tautan Google Drive wajib diisi." : needsFile ? "Pilih file terlebih dahulu." : "Tautan atau jawaban wajib diisi.", "error");
      return;
    }
    if (data.tipe === "link" && !/^https?:\/\/\S+/i.test(data.isi)) {
      onRefresh("Masukkan tautan yang diawali http:// atau https://.", "error");
      return;
    }
    if (data.tipe === "gdrive" && !/^https?:\/\/(drive|docs)\.google\.com\//i.test(data.driveUrl)) {
      onRefresh("Masukkan tautan Google Drive atau Google Docs yang valid.", "error");
      return;
    }
    db.submitTugas(task.id, user.id, data);
    onRefresh("Tugas berhasil dikumpulkan.");
  }
  function handleFile(taskId, event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      onRefresh("Ukuran file maksimal 5 MB.", "error");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateAnswer(taskId, "file", {
      nama: file.name,
      tipeMime: file.type,
      ukuran: file.size,
      data: reader.result,
    });
    reader.onerror = () => onRefresh("File tidak dapat dibaca. Coba pilih file lain.", "error");
    reader.readAsDataURL(file);
  }
  function gradeSubmission(submission) {
    const values = gradeForms[submission.id] || { nilai: submission.nilai ?? "", feedback: submission.feedback || "" };
    try {
      db.gradeTugas(submission.id, values.nilai, values.feedback);
      onRefresh("Nilai dan feedback berhasil disimpan.");
    } catch (error) {
      onRefresh(error.message, "error");
    }
  }
  function updateGradeForm(submission, field, value) {
    const current = gradeForms[submission.id] || { nilai: submission.nilai ?? "", feedback: submission.feedback || "" };
    setGradeForms({ ...gradeForms, [submission.id]: { ...current, [field]: value } });
  }
  return (
    <div className="two-column">
      <Panel title={`Tugas ${activeKelas?.nama || ""}`}>
        {tasks.map((task) => {
          const submission = user.peran === "siswa" ? db.getPengumpulanSiswa(task.id, user.id) : null;
          const submissions = user.peran === "guru" ? db.getPengumpulanForTugas(task.id) : [];
          return (
            <div className="task-card" key={task.id}>
              <div>
                <strong>{task.judul}</strong>
                <small>Tenggat: {formatDate(task.tenggat)}</small>
                <p>{task.deskripsi}</p>
              </div>
              {user.peran === "siswa" ? (
                <>
                  <label className="field">Jenis pengumpulan
                    <select value={answers[task.id]?.tipe || submission?.tipe || "link"} onChange={(event) => updateAnswer(task.id, "tipe", event.target.value)}>
                      <option value="link">Tautan / link</option>
                      <option value="dokumen">Dokumen (PDF, Word, ZIP)</option>
                      <option value="foto">Foto (JPG, PNG)</option>
                      <option value="gdrive">Google Drive</option>
                    </select>
                  </label>
                  {(answers[task.id]?.tipe || submission?.tipe || "link") === "link" && (
                    <label className="field">Tautan jawaban
                      <input type="url" value={answers[task.id]?.isi ?? (submission?.tipe === "link" ? submission.isi : "")} onChange={(event) => updateAnswer(task.id, "isi", event.target.value)} placeholder="https://..." />
                    </label>
                  )}
                  {(answers[task.id]?.tipe || submission?.tipe) === "gdrive" && (
                    <>
                      <label className="field">Tautan Google Drive / Docs
                        <input type="url" value={answers[task.id]?.driveUrl ?? submission?.driveUrl ?? ""} onChange={(event) => updateAnswer(task.id, "driveUrl", event.target.value)} placeholder="https://drive.google.com/..." />
                      </label>
                      <button type="button" className="btn btn-ghost" onClick={() => window.open("https://drive.google.com/drive/my-drive", "_blank", "noopener,noreferrer")}>Buka Google Drive</button>
                    </>
                  )}
                  {["dokumen", "foto"].includes(answers[task.id]?.tipe || submission?.tipe) && (
                    <label className="field">Pilih {answers[task.id]?.tipe || submission?.tipe}
                      <input type="file" accept={(answers[task.id]?.tipe || submission?.tipe) === "foto" ? "image/*" : ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"} onChange={(event) => handleFile(task.id, event)} />
                      {(answers[task.id]?.file || submission?.file) && <small>File: {(answers[task.id]?.file || submission.file).nama}</small>}
                    </label>
                  )}
                  <label className="field">Catatan (opsional)
                    <textarea value={answers[task.id]?.isi ?? (["link", "gdrive"].includes(submission?.tipe) ? "" : submission?.isi || "")} onChange={(event) => updateAnswer(task.id, "isi", event.target.value)} placeholder="Tambahkan keterangan..." />
                  </label>
                  <button className="btn btn-primary" onClick={() => submitTask(task)}>Kumpulkan</button>
                  {submission?.nilai != null && <small>Nilai: {submission.nilai} · {submission.feedback || "Belum ada feedback."}</small>}
                </>
              ) : (
                <div style={{ width: "100%" }}>
                  <span className="badge badge-yellow">{submissions.length} terkumpul</span>
                  {submissions.map((item) => {
                    const student = db.getUserById(item.siswaId);
                    const values = gradeForms[item.id] || { nilai: item.nilai ?? "", feedback: item.feedback || "" };
                    return (
                      <div className="submission-row" key={item.id}>
                        <div>
                          <strong>{student?.nama || "Siswa"}</strong>
                          <small>{formatDate(item.waktuKumpul)} · {item.status}</small>
                          {item.isi && <p>{item.isi}</p>}
                          {item.driveUrl && <a className="submission-link" href={item.driveUrl} target="_blank" rel="noreferrer">Buka Google Drive / Docs</a>}
                          {item.file?.data && <a className="submission-link" href={item.file.data} download={item.file.nama}>Unduh {item.file.nama}</a>}
                        </div>
                        <div className="grading-form">
                          <label className="field">Nilai<input type="number" min="0" max="100" value={values.nilai} onChange={(event) => updateGradeForm(item, "nilai", event.target.value)} /></label>
                          <label className="field">Feedback<textarea value={values.feedback} onChange={(event) => updateGradeForm(item, "feedback", event.target.value)} /></label>
                          <button className="btn btn-teal" onClick={() => gradeSubmission(item)}>Simpan nilai</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {!tasks.length && <Empty text="Belum ada tugas." />}
      </Panel>
      {user.peran === "guru" && <Panel title="Buat tugas"><form className="stack-form" onSubmit={createTask}><Field label="Judul tugas" value={form.judul} onChange={(value) => setForm({ ...form, judul: value })} /><Field label="Deskripsi" value={form.deskripsi} onChange={(value) => setForm({ ...form, deskripsi: value })} /><label className="field">Tenggat<input type="datetime-local" value={form.tenggat} onChange={(event) => setForm({ ...form, tenggat: event.target.value })} /></label><button className="btn btn-teal">Terbitkan tugas</button></form></Panel>}
    </div>
  );
}

function Quizzes({ user, activeKelas, onRefresh }) {
  const [answers, setAnswers] = useState({});
  const quizzes = activeKelas ? db.getKuisByKelas(activeKelas.id) : [];
  function submit(quiz) { try { db.submitHasilKuis(quiz.id, user.id, answers[quiz.id] || {}, new Date().toISOString()); onRefresh("Kuis selesai dan nilai tersimpan."); } catch (error) { onRefresh(error.message, "error"); } }
  return <Panel title={`Kuis ${activeKelas?.nama || ""}`}>{quizzes.map((quiz) => { const result = user.peran === "siswa" ? db.getHasilKuisSiswa(quiz.id, user.id) : null; return <div className="quiz-card" key={quiz.id}><h3>{quiz.judul}</h3><small>Durasi {quiz.durasiMenit} menit · {quiz.soal.length} soal</small>{result ? <span className="badge badge-teal">Nilai {result.skor}</span> : user.peran === "siswa" ? <><div className="quiz-questions">{quiz.soal.map((question, index) => <fieldset key={question.id}><legend>{index + 1}. {question.teks}</legend>{question.pilihan.map((choice, choiceIndex) => <label key={choice}><input type="radio" name={`${quiz.id}-${question.id}`} onChange={() => setAnswers({ ...answers, [quiz.id]: { ...(answers[quiz.id] || {}), [index]: choiceIndex } })} /> {choice}</label>)}</fieldset>)}</div><button className="btn btn-primary" onClick={() => submit(quiz)}>Kirim jawaban</button></> : <span className="badge badge-yellow">{db.getHasilKuisByKuis(quiz.id).length} pengerjaan</span>}</div>; })}{!quizzes.length && <Empty text="Belum ada kuis." />}</Panel>;
}

function Forum({ user, activeKelas, onRefresh }) { const [form, setForm] = useState({ judul: "", isi: "" }); const topics = activeKelas ? db.getForumByKelas(activeKelas.id) : []; function add(event) { event.preventDefault(); if (!activeKelas || !form.judul.trim() || !form.isi.trim()) return; db.addForumTopik(activeKelas.id, { ...form, penulisId: user.id }); setForm({ judul: "", isi: "" }); onRefresh("Topik forum berhasil dibuat."); } return <div className="two-column"><Panel title="Diskusi kelas">{topics.map((topic) => <div className="list-row" key={topic.id}><div><strong>{topic.judul}</strong><small>{formatDate(topic.waktu)} · {topic.balasan.length} balasan</small><p>{topic.isi}</p></div></div>)}{!topics.length && <Empty text="Belum ada topik diskusi." />}</Panel><Panel title="Mulai diskusi"><form className="stack-form" onSubmit={add}><Field label="Judul" value={form.judul} onChange={(value) => setForm({ ...form, judul: value })} /><label className="field">Pertanyaan<textarea value={form.isi} onChange={(event) => setForm({ ...form, isi: event.target.value })} /></label><button className="btn btn-teal">Posting topik</button></form></Panel></div>; }

function LiveClasses({ user, activeKelas, onRefresh }) { const [form, setForm] = useState({ judul: "", waktu: "", tautan: "" }); const lives = activeKelas ? db.getLiveClassByKelas(activeKelas.id) : []; function add(event) { event.preventDefault(); if (!activeKelas || !form.judul.trim() || !form.waktu || !form.tautan.trim()) return; try { db.addLiveClass(activeKelas.id, form); } catch (error) { onRefresh(error.message, "error"); return; } setForm({ judul: "", waktu: "", tautan: "" }); onRefresh("Live class berhasil dijadwalkan."); } return <div className="two-column"><Panel title="Jadwal live class">{lives.map((live) => <div className="list-row" key={live.id}><div><strong>{live.judul}</strong><small>{formatDate(live.waktu)}</small></div>{user.peran === "siswa" ? <button className="btn btn-primary" onClick={() => { db.joinLiveClass(live.id, user.id); window.open(live.tautan, "_blank", "noopener,noreferrer"); onRefresh("Kehadiran dicatat."); }}>Gabung</button> : <a className="btn btn-primary" href={live.tautan} target="_blank" rel="noreferrer">Buka</a>}</div>)}{!lives.length && <Empty text="Belum ada jadwal live class." />}</Panel>{user.peran === "guru" && <Panel title="Jadwalkan live class"><form className="stack-form" onSubmit={add}><Field label="Judul" value={form.judul} onChange={(value) => setForm({ ...form, judul: value })} /><label className="field">Waktu<input type="datetime-local" value={form.waktu} onChange={(event) => setForm({ ...form, waktu: event.target.value })} /></label><Field label="Tautan meeting" value={form.tautan} onChange={(value) => setForm({ ...form, tautan: value })} placeholder="https://..." /><button className="btn btn-teal">Jadwalkan</button></form></Panel>}</div>; }

function Grades({ user }) {
  if (user.peran === "guru") {
    const classes = db.getKelasForGuru(user.id);
    const tasks = classes.flatMap((item) => db.getTugasByKelas(item.id).map((task) => ({ ...task, kelas: item.nama })));
    return <Panel title="Rekap penilaian kelas">{tasks.map((task) => {
      const submissions = db.getPengumpulanForTugas(task.id);
      const graded = submissions.filter((item) => item.nilai != null);
      const average = graded.length ? Math.round(graded.reduce((sum, item) => sum + item.nilai, 0) / graded.length) : null;
      return <div className="list-row" key={task.id}><div><strong>{task.judul}</strong><small>{task.kelas} · {graded.length}/{submissions.length} sudah dinilai</small></div><strong>{average ?? "-"}</strong></div>;
    })}<Empty text={!tasks.length ? "Belum ada tugas untuk direkap." : ""} /></Panel>;
  }
  const records = db.getRekapNilaiSiswa(user.id);
  return <Panel title="Nilai dan rapor">{records.map((record) => <div className="list-row" key={record.kelas.id}><div><strong>{record.kelas.nama} · {record.kelas.mapel}</strong>{record.rincian.map((item) => <small key={item.id}>{item.jenis}: {item.judul} · {item.nilai}</small>)}{!record.rincian.length && <small>Belum ada nilai masuk.</small>}</div><strong>{record.rataRata ?? "-"}</strong></div>)}<Empty text={!records.length ? "Kamu belum terdaftar di kelas mana pun." : ""} /></Panel>;
}

function Accounts({ user, onRefresh }) {
  const [form, setForm] = useState({ nama: "", identifier: "", password: "", peran: "siswa", mapel: "", kelasId: "" });
  if (user.peran !== "admin") return <Panel title="Kelola akun"><Empty text="Hanya admin sekolah yang dapat menambahkan akun." /></Panel>;
  const users = db.getAllUsers();
  function downloadData() {
    const file = new Blob([db.exportAccountData()], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "data-akun.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }
  function create(event) { event.preventDefault(); try { db.createUserByAdmin(form); setForm({ nama: "", identifier: "", password: "", peran: "siswa", mapel: "", kelasId: "" }); onRefresh("Akun baru berhasil dibuat."); } catch (error) { onRefresh(error.message, "error"); } }
  return <div className="two-column"><Panel title="Akun terdaftar"><div className="panel-actions"><button type="button" className="btn btn-ghost" onClick={downloadData}>Unduh data-akun.json</button></div>{users.map((item) => <div className="list-row" key={item.id}><div><strong>{item.nama}</strong><small>{item.peran} · {item.identifier}{item.mapel ? ` · ${item.mapel}` : ""}</small><small>{item.jumlahLogin || 0} kali login{item.terakhirLogin ? ` · terakhir ${formatDate(item.terakhirLogin)}` : ""}</small></div><div className="row-actions"><span className={`badge badge-${item.peran === "admin" ? "ink" : item.peran === "guru" ? "yellow" : "teal"}`}>{item.peran}</span>{item.id !== user.id && <button className="btn btn-danger" onClick={() => { if (window.confirm(`Hapus akun ${item.nama}?`)) { try { db.deleteUserByAdmin(item.id); onRefresh("Akun berhasil dihapus."); } catch (error) { onRefresh(error.message, "error"); } } }}>Hapus</button>}</div></div>)}</Panel><Panel title="Tambahkan akun"><form className="stack-form" onSubmit={create}><Field label="Nama lengkap" value={form.nama} onChange={(value) => setForm({ ...form, nama: value })} /><Field label={form.peran === "siswa" ? "NISN" : "Email / identitas"} value={form.identifier} onChange={(value) => setForm({ ...form, identifier: value })} /><label className="field">Peran<select value={form.peran} onChange={(event) => setForm({ ...form, peran: event.target.value })}><option value="siswa">Siswa</option><option value="guru">Guru</option><option value="admin">Admin</option></select></label>{form.peran === "siswa" && <label className="field">Kelas<select required value={form.kelasId} onChange={(event) => setForm({ ...form, kelasId: event.target.value })}><option value="">Pilih kelas</option>{db.getAllKelas().map((item) => <option key={item.id} value={item.id}>{item.nama} · {item.mapel}</option>)}</select></label>}{form.peran === "guru" && <Field label="Mata pelajaran" value={form.mapel} onChange={(value) => setForm({ ...form, mapel: value })} />}<label className="field">Kata sandi<input required minLength="6" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label><button className="btn btn-teal">Simpan akun</button></form></Panel></div>;
}

export function WorkspaceNav({ role }) { const base = role === "admin" ? "/admin" : role === "guru" ? "/guru" : "/siswa"; const items = role === "admin" ? sections : sections.filter(([id]) => id !== "akun"); return items.map(([id, label]) => ({ label, to: `${base}/${id}` })); }