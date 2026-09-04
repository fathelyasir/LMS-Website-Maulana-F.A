import React, { useState, useMemo } from "react";
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
              <div className="card" style={{ padding: 40, textAlign: "center" }}>
                <h2>Panel Admin</h2>
                <p style={{ color: "var(--muted)", marginTop: 12 }}>Halaman ini sedang dalam pengembangan.</p>
              </div>
            )}
          </>
        )}
        {section === "kelas" && <Classes user={user} kelas={kelas} activeKelas={activeKelas} onRefresh={refresh} />}
        {section === "tugas" && <Tasks user={user} kelas={kelas} activeKelas={activeKelas} onRefresh={refresh} />}
        {section === "kuis" && <Quizzes user={user} kelas={kelas} activeKelas={activeKelas} onRefresh={refresh} />}
        {section === "forum" && <Forum user={user} activeKelas={activeKelas} onRefresh={refresh} />}
        {section === "live" && <LiveClasses user={user} activeKelas={activeKelas} onRefresh={refresh} />}
        {section === "nilai" && <Grades user={user} />}
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

function Empty({ text }) { return <p className="empty-state">{text}</p>; }

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
  const tasks = activeKelas ? db.getTugasByKelas(activeKelas.id) : [];
  function createTask(event) { event.preventDefault(); if (!activeKelas || !form.judul.trim() || !form.tenggat) return; db.addTugas(activeKelas.id, { ...form, tenggat: new Date(form.tenggat).toISOString() }); setForm({ judul: "", deskripsi: "", tenggat: "" }); onRefresh("Tugas berhasil dibuat."); }
  function submitTask(task) { if (!answers[task.id]?.trim()) return; db.submitTugas(task.id, user.id, answers[task.id]); onRefresh("Tugas berhasil dikumpulkan."); }
  return <div className="two-column"><Panel title={`Tugas ${activeKelas?.nama || ""}`}>{tasks.map((task) => { const submission = user.peran === "siswa" ? db.getPengumpulanSiswa(task.id, user.id) : null; return <div className="task-card" key={task.id}><div><strong>{task.judul}</strong><small>Tenggat: {formatDate(task.tenggat)}</small><p>{task.deskripsi}</p></div>{user.peran === "siswa" ? <><textarea value={answers[task.id] ?? submission?.isi ?? ""} onChange={(event) => setAnswers({ ...answers, [task.id]: event.target.value })} placeholder="Tulis jawaban atau tautan" /><button className="btn btn-primary" onClick={() => submitTask(task)}>Kumpulkan</button></> : <span className="badge badge-yellow">{db.getPengumpulanForTugas(task.id).length} terkumpul</span>}</div>; })}{!tasks.length && <Empty text="Belum ada tugas." />}</Panel>{user.peran === "guru" && <Panel title="Buat tugas"><form className="stack-form" onSubmit={createTask}><Field label="Judul tugas" value={form.judul} onChange={(value) => setForm({ ...form, judul: value })} /><Field label="Deskripsi" value={form.deskripsi} onChange={(value) => setForm({ ...form, deskripsi: value })} /><label className="field">Tenggat<input type="datetime-local" value={form.tenggat} onChange={(event) => setForm({ ...form, tenggat: event.target.value })} /></label><button className="btn btn-teal">Terbitkan tugas</button></form></Panel>}</div>;
}

function Quizzes({ user, activeKelas, onRefresh }) {
  const [answers, setAnswers] = useState({});
  const quizzes = activeKelas ? db.getKuisByKelas(activeKelas.id) : [];
  function submit(quiz) { try { db.submitHasilKuis(quiz.id, user.id, answers[quiz.id] || {}, new Date().toISOString()); onRefresh("Kuis selesai dan nilai tersimpan."); } catch (error) { onRefresh(error.message, "error"); } }
  return <Panel title={`Kuis ${activeKelas?.nama || ""}`}>{quizzes.map((quiz) => { const result = user.peran === "siswa" ? db.getHasilKuisSiswa(quiz.id, user.id) : null; return <div className="quiz-card" key={quiz.id}><h3>{quiz.judul}</h3><small>Durasi {quiz.durasiMenit} menit · {quiz.soal.length} soal</small>{result ? <span className="badge badge-teal">Nilai {result.skor}</span> : user.peran === "siswa" ? <><div className="quiz-questions">{quiz.soal.map((question, index) => <fieldset key={question.id}><legend>{index + 1}. {question.teks}</legend>{question.pilihan.map((choice, choiceIndex) => <label key={choice}><input type="radio" name={`${quiz.id}-${question.id}`} onChange={() => setAnswers({ ...answers, [quiz.id]: { ...(answers[quiz.id] || {}), [index]: choiceIndex } })} /> {choice}</label>)}</fieldset>)}</div><button className="btn btn-primary" onClick={() => submit(quiz)}>Kirim jawaban</button></> : <span className="badge badge-yellow">{db.getHasilKuisByKuis(quiz.id).length} pengerjaan</span>}</div>; })}{!quizzes.length && <Empty text="Belum ada kuis." />}</Panel>;
}

function Forum({ user, activeKelas, onRefresh }) { const [form, setForm] = useState({ judul: "", isi: "" }); const topics = activeKelas ? db.getForumByKelas(activeKelas.id) : []; function add(event) { event.preventDefault(); if (!activeKelas || !form.judul.trim() || !form.isi.trim()) return; db.addForumTopik(activeKelas.id, { ...form, penulisId: user.id }); setForm({ judul: "", isi: "" }); onRefresh("Topik forum berhasil dibuat."); } return <div className="two-column"><Panel title="Diskusi kelas">{topics.map((topic) => <div className="list-row" key={topic.id}><div><strong>{topic.judul}</strong><small>{formatDate(topic.waktu)} · {topic.balasan.length} balasan</small><p>{topic.isi}</p></div></div>)}{!topics.length && <Empty text="Belum ada topik diskusi." />}</Panel><Panel title="Mulai diskusi"><form className="stack-form" onSubmit={add}><Field label="Judul" value={form.judul} onChange={(value) => setForm({ ...form, judul: value })} /><label className="field">Pertanyaan<textarea value={form.isi} onChange={(event) => setForm({ ...form, isi: event.target.value })} /></label><button className="btn btn-teal">Posting topik</button></form></Panel></div>; }

function LiveClasses({ user, activeKelas, onRefresh }) { const [form, setForm] = useState({ judul: "", waktu: "", tautan: "" }); const lives = activeKelas ? db.getLiveClassByKelas(activeKelas.id) : []; function add(event) { event.preventDefault(); if (!activeKelas || !form.judul.trim() || !form.waktu || !form.tautan.trim()) return; db.addLiveClass(activeKelas.id, { ...form, waktu: new Date(form.waktu).toISOString() }); setForm({ judul: "", waktu: "", tautan: "" }); onRefresh("Live class berhasil dijadwalkan."); } return <div className="two-column"><Panel title="Jadwal live class">{lives.map((live) => <div className="list-row" key={live.id}><div><strong>{live.judul}</strong><small>{formatDate(live.waktu)}</small></div>{user.peran === "siswa" ? <button className="btn btn-primary" onClick={() => { db.joinLiveClass(live.id, user.id); window.open(live.tautan, "_blank", "noopener,noreferrer"); onRefresh("Kehadiran dicatat."); }}>Gabung</button> : <a className="btn btn-primary" href={live.tautan} target="_blank" rel="noreferrer">Buka</a>}</div>)}{!lives.length && <Empty text="Belum ada jadwal live class." />}</Panel>{user.peran === "guru" && <Panel title="Jadwalkan live class"><form className="stack-form" onSubmit={add}><Field label="Judul" value={form.judul} onChange={(value) => setForm({ ...form, judul: value })} /><label className="field">Waktu<input type="datetime-local" value={form.waktu} onChange={(event) => setForm({ ...form, waktu: event.target.value })} /></label><Field label="Tautan meeting" value={form.tautan} onChange={(value) => setForm({ ...form, tautan: value })} placeholder="https://..." /><button className="btn btn-teal">Jadwalkan</button></form></Panel>}</div>; }

function Grades({ user }) { const records = user.peran === "siswa" ? db.getRekapNilaiSiswa(user.id) : []; return <Panel title="Nilai dan rapor">{user.peran !== "siswa" ? <Empty text="Rekap nilai siswa tersedia di modul penilaian guru." /> : records.map((record) => <div className="list-row" key={record.kelas.id}><div><strong>{record.kelas.nama} · {record.kelas.mapel}</strong>{record.rincian.map((item) => <small key={item.judul}>{item.jenis}: {item.judul} · {item.nilai}</small>)}</div><strong>{record.rataRata ?? "-"}</strong></div>)}</Panel>; }

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
  return <div className="two-column"><Panel title="Akun terdaftar"><div className="panel-actions"><button type="button" className="btn btn-ghost" onClick={downloadData}>Unduh data-akun.json</button></div>{users.map((item) => <div className="list-row" key={item.id}><div><strong>{item.nama}</strong><small>{item.peran} · {item.identifier}{item.mapel ? ` · ${item.mapel}` : ""}</small><small>{item.jumlahLogin || 0} kali login{item.terakhirLogin ? ` · terakhir ${formatDate(item.terakhirLogin)}` : ""}</small></div><span className={`badge badge-${item.peran === "admin" ? "ink" : item.peran === "guru" ? "yellow" : "teal"}`}>{item.peran}</span></div>)}</Panel><Panel title="Tambahkan akun"><form className="stack-form" onSubmit={create}><Field label="Nama lengkap" value={form.nama} onChange={(value) => setForm({ ...form, nama: value })} /><Field label={form.peran === "siswa" ? "NISN" : "Email / identitas"} value={form.identifier} onChange={(value) => setForm({ ...form, identifier: value })} /><label className="field">Peran<select value={form.peran} onChange={(event) => setForm({ ...form, peran: event.target.value })}><option value="siswa">Siswa</option><option value="guru">Guru</option><option value="admin">Admin</option></select></label>{form.peran === "siswa" && <label className="field">Kelas<select required value={form.kelasId} onChange={(event) => setForm({ ...form, kelasId: event.target.value })}><option value="">Pilih kelas</option>{db.getAllKelas().map((item) => <option key={item.id} value={item.id}>{item.nama} · {item.mapel}</option>)}</select></label>}{form.peran === "guru" && <Field label="Mata pelajaran" value={form.mapel} onChange={(value) => setForm({ ...form, mapel: value })} />}<label className="field">Kata sandi<input required minLength="6" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label><button className="btn btn-teal">Simpan akun</button></form></Panel></div>;
}

export function WorkspaceNav({ role }) { const base = role === "admin" ? "/admin" : role === "guru" ? "/guru" : "/siswa"; const items = role === "admin" ? sections : sections.filter(([id]) => id !== "akun"); return items.map(([id, label]) => ({ label, to: `${base}/${id}` })); }