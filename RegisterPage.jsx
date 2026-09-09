import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./Authcontext.jsx";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerSiswa } = useAuth();
  const [form, setForm] = useState({ nama: "", nisn: "", kodeKelas: "", password: "", confirmPassword: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  function update(field, value) { setForm((current) => ({ ...current, [field]: value })); }

  function submit(event) {
    event.preventDefault();
    setStatus(null);
    if (form.password !== form.confirmPassword) {
      setStatus({ type: "error", message: "Konfirmasi kata sandi belum sama." });
      return;
    }
    setLoading(true);
    const result = registerSiswa({ nama: form.nama, nisn: form.nisn, kodeKelas: form.kodeKelas, password: form.password });
    setLoading(false);
    if (!result.ok) {
      setStatus({ type: "error", message: result.message });
      return;
    }
    navigate("/siswa/ringkasan", { replace: true });
  }

  return <main className="auth-page register-page">
    <section className="auth-aside">
      <Link className="auth-brand" to="/landing"><span className="auth-mark" />Kelasku</Link>
      <div><span className="auth-kicker">RUANG BELAJAR / 02</span><h1>Mulai dari satu kelas kecil.</h1><p>Masuk ke materi, tugas, kuis, dan diskusi sekolahmu dalam satu ruang yang rapi.</p></div>
      <div className="auth-aside-note"><strong>Butuh akun guru atau admin?</strong><span>Mintalah admin sekolah membuatkannya melalui panel Kelola akun.</span></div>
    </section>
    <section className="auth-card card">
      <Link to="/landing" className="auth-home-link">← Kembali ke halaman utama</Link>
      <div className="auth-card-head"><div><span className="auth-kicker">AKUN SISWA</span><h2>Buat akun baru</h2></div><Link to="/masuk" className="auth-back">Sudah punya akun?</Link></div>
      <p className="auth-description">Gunakan kode kelas dari guru untuk langsung bergabung ke rombel.</p>
      <form className="auth-form" onSubmit={submit}>
        <label className="field">Nama lengkap<input required value={form.nama} onChange={(event) => update("nama", event.target.value)} placeholder="Contoh: Raka Saputra" /></label>
        <label className="field">NISN<input required inputMode="numeric" pattern="[0-9]{8,20}" value={form.nisn} onChange={(event) => update("nisn", event.target.value)} placeholder="Minimal 8 digit" /></label>
        <label className="field">Kode kelas<input required value={form.kodeKelas} onChange={(event) => update("kodeKelas", event.target.value.toUpperCase())} placeholder="Contoh: MTK8A1" /></label>
        <div className="auth-form-grid"><label className="field">Kata sandi<input required minLength="6" type="password" value={form.password} onChange={(event) => update("password", event.target.value)} placeholder="Minimal 6 karakter" /></label><label className="field">Ulangi kata sandi<input required minLength="6" type="password" value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} placeholder="Ketik ulang" /></label></div>
        {status && <div className={`toast toast-${status.type}`} role="alert">{status.message}</div>}
        <button className="btn btn-teal auth-submit" disabled={loading}>{loading ? "Membuat akun..." : "Buat akun siswa"}</button>
      </form>
      <p className="auth-legal">Dengan mendaftar, data akun disimpan pada perangkat demo ini.</p>
    </section>
  </main>;
}
