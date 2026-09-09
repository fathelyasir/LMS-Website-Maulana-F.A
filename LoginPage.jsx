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
        <Link to="/landing" style={styles.homeLink}>← Kembali ke halaman utama</Link>
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
    --ink:#E7F0ED; --ink-soft:#B5C7C2; --muted:#82958F;
    --bg:#0E171C; --surface:#162329; --border:rgba(174,205,196,.16);
    --yellow:#E7C979; --teal:#83C8B6; --teal-dark:#5BAA98; --coral:#DF918C;
  }
`;

const styles = {
  page: {
    minHeight: "100vh",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-body)",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    background: "linear-gradient(145deg,rgba(29,46,52,.94),rgba(19,32,38,.96))",
    border: "1px solid var(--border)",
    borderRadius: 20,
    padding: "36px 32px",
    boxShadow: "0 24px 60px rgba(0,0,0,.28)",
  },
  homeLink: {
    display: "inline-flex",
    alignItems: "center",
    marginBottom: 22,
    color: "var(--teal)",
    fontSize: 13,
    fontWeight: 700,
  },
  brandRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 28 },
  brandMark: {
    width: 26, height: 26, borderRadius: 7,
    background: "linear-gradient(135deg, var(--teal), #6B9F98)",
  },
  brandName: { fontWeight: 700, fontSize: 18, color: "var(--ink)" },
  title: { fontSize: 24, fontWeight: 700, color: "var(--ink)", margin: 0 },
  subtitle: { fontSize: 14.5, color: "var(--muted)", marginTop: 8, lineHeight: 1.5 },
  roleRow: { display: "flex", gap: 8, marginTop: 22 },
  roleBtn: {
    flex: 1, padding: "9px 6px", borderRadius: 10, borderWidth: 1, borderStyle: "solid", borderColor: "var(--border)",
    background: "var(--bg)", color: "var(--ink-soft)", fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  roleBtnActive: { background: "linear-gradient(135deg,var(--teal),#6BB5A4)", color: "#10211F", borderColor: "var(--teal)" },
  form: { marginTop: 22, display: "flex", flexDirection: "column", gap: 16 },
  label: { fontSize: 13.5, fontWeight: 600, color: "var(--ink-soft)", display: "flex", flexDirection: "column", gap: 6 },
  input: {
    fontFamily: "inherit", fontSize: 15, padding: "11px 12px", borderRadius: 10,
    border: "1px solid var(--border)", outline: "none", background: "rgba(8,18,23,.62)", color: "var(--ink)",
  },
  status: { fontSize: 13.5, padding: "10px 12px", borderRadius: 10 },
  statusError: { background: "rgba(255,120,146,.12)", color: "var(--coral)" },
  statusSuccess: { background: "rgba(131,200,182,.12)", color: "var(--teal)" },
  submit: {
    marginTop: 4, padding: "12px", borderRadius: 999, border: "none",
    background: "linear-gradient(135deg,var(--teal),#6BB5A4)", color: "#10211F", fontWeight: 800, fontSize: 15, cursor: "pointer",
  },
  footerLinks: { marginTop: 20, display: "flex", flexDirection: "column", gap: 8, fontSize: 13.5 },
  linkBtn: { background: "none", border: "none", color: "var(--teal-dark)", fontWeight: 600, cursor: "pointer", padding: 0, textAlign: "left" },
};