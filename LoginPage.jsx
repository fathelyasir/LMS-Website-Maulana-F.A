import React, { useState } from "react";
import { useAuth } from "./Authcontext.jsx";
import { Link, useNavigate } from "react-router-dom";

const ROLES = [
  { id: "siswa", label: "Siswa", hint: "Masuk pakai NISN" },
  { id: "guru", label: "Guru", hint: "Masuk pakai NIP / email" },
  { id: "admin", label: "Admin Sekolah", hint: "Masuk pakai email" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [role, setRole] = useState("siswa");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    if (!identifier || (mode === "login" && !password)) {
      setStatus({ type: "error", message: "Lengkapi semua kolom sebelum melanjutkan." });
      return;
    }

    setLoading(true);
    try {
      if (mode === "lupa-sandi") {
        await new Promise((r) => setTimeout(r, 400));
        setStatus({ type: "success", message: "Tautan reset kata sandi telah dikirim ke email terdaftar." });
      } else {
        const result = loginUser(identifier, password, role);
        if (!result.ok) {
          setStatus({ type: "error", message: result.message });
          return;
        }
        navigate(`/${result.user.peran}/ringkasan`, { replace: true });
      }
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Terjadi kesalahan, coba lagi." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <style>{css}</style>
      <div style={styles.card}>
        <div style={styles.brandRow}>
          <span style={styles.brandMark} />
          <span style={styles.brandName}>Kelasku</span>
        </div>

        <h1 style={styles.title}>
          {mode === "login" ? "Masuk ke akun kamu" : "Lupa kata sandi"}
        </h1>
        <p style={styles.subtitle}>
          {mode === "login"
            ? "Pilih peran, lalu masuk dengan akun yang terdaftar di sekolahmu."
            : "Masukkan email yang terdaftar, kami akan kirim tautan untuk atur ulang kata sandi."}
        </p>

        {mode === "login" && (
          <div style={styles.roleRow}>
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                style={{
                  ...styles.roleBtn,
                  ...(role === r.id ? styles.roleBtnActive : {}),
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            {role === "siswa" && mode === "login" ? "NISN atau Email" : "Email"}
            <input
              style={styles.input}
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={role === "siswa" ? "Contoh: 0051234567" : "nama@sekolah.sch.id"}
            />
          </label>

          {mode === "login" && (
            <label style={styles.label}>
              Kata Sandi
              <input
                style={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>
          )}

          {status && (
            <div
              style={{
                ...styles.status,
                ...(status.type === "error" ? styles.statusError : styles.statusSuccess),
              }}
            >
              {status.message}
            </div>
          )}

          <button type="submit" style={styles.submit} disabled={loading}>
            {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Kirim Tautan Reset"}
          </button>
        </form>

        <div style={styles.footerLinks}>
          {mode === "login" ? (
            <button style={styles.linkBtn} onClick={() => setMode("lupa-sandi")}>
              Lupa kata sandi?
            </button>
          ) : (
            <button style={styles.linkBtn} onClick={() => setMode("login")}>
              Kembali ke halaman masuk
            </button>
          )}
          {mode === "login" && <Link className="login-register-link" to="/daftar">Belum punya akun? Daftar sebagai siswa</Link>}
          <span style={{ color: "var(--muted)" }}>Akun guru dan admin dibuat oleh admin sekolah.</span>
        </div>
      </div>
    </div>
  );
}

const css = `
  :root{
    --ink:#16213E; --ink-soft:#3A4360; --muted:#5B6478;
    --bg:#F4F6FB; --surface:#FFFFFF; --border:#E2E6F0;
    --yellow:#FFC93C; --teal:#2FA88E; --teal-dark:#1F8E77; --coral:#FF6B6B;
  }
`;

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, system-ui, sans-serif",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 20,
    padding: "36px 32px",
    boxShadow: "0 30px 60px -30px rgba(22,33,62,0.25)",
  },
  brandRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 28 },
  brandMark: {
    width: 26, height: 26, borderRadius: 7,
    background: "linear-gradient(135deg, var(--teal), var(--ink))",
  },
  brandName: { fontWeight: 700, fontSize: 18, color: "var(--ink)" },
  title: { fontSize: 24, fontWeight: 700, color: "var(--ink)", margin: 0 },
  subtitle: { fontSize: 14.5, color: "var(--muted)", marginTop: 8, lineHeight: 1.5 },
  roleRow: { display: "flex", gap: 8, marginTop: 22 },
  roleBtn: {
    flex: 1, padding: "9px 6px", borderRadius: 10, borderWidth: 1, borderStyle: "solid", borderColor: "var(--border)",
    background: "var(--bg)", color: "var(--ink-soft)", fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  roleBtnActive: { background: "var(--ink)", color: "#fff", borderColor: "var(--ink)" },
  form: { marginTop: 22, display: "flex", flexDirection: "column", gap: 16 },
  label: { fontSize: 13.5, fontWeight: 600, color: "var(--ink-soft)", display: "flex", flexDirection: "column", gap: 6 },
  input: {
    fontFamily: "inherit", fontSize: 15, padding: "11px 12px", borderRadius: 10,
    border: "1px solid var(--border)", outline: "none",
  },
  status: { fontSize: 13.5, padding: "10px 12px", borderRadius: 10 },
  statusError: { background: "rgba(255,107,107,0.12)", color: "#B23A3A" },
  statusSuccess: { background: "rgba(47,168,142,0.12)", color: "#1F8E77" },
  submit: {
    marginTop: 4, padding: "12px", borderRadius: 999, border: "none",
    background: "var(--teal)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
  },
  footerLinks: { marginTop: 20, display: "flex", flexDirection: "column", gap: 8, fontSize: 13.5 },
  linkBtn: { background: "none", border: "none", color: "var(--teal-dark)", fontWeight: 600, cursor: "pointer", padding: 0, textAlign: "left" },
};