import React from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardSiswa({ 
  namaSiswa = "Raka", 
  tugasAktif = [], 
  ulanganMendatang = [], 
  nilaiTerbaru = [],
  onNavigate 
}) {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    if (onNavigate) onNavigate(path);
    else navigate(path);
  };

  return (
    <div style={styles.page}>
      <style>{css}</style>

      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Dashboard Siswa</p>
          <h1 style={styles.title}>Semangat belajar, {namaSiswa}!</h1>
        </div>
      </header>

      <section style={styles.grid}>
        {/* Tugas aktif */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Tugas yang Perlu Dikerjakan</h2>
          <div style={styles.list}>
            {tugasAktif.map((t) => (
              <div key={t.id} style={styles.item}>
                <div>
                  <div style={styles.itemTitle}>{t.judul}</div>
                  <div style={styles.itemMeta}>{t.mapel} · Tenggat: {t.tenggat}</div>
                </div>
                <span style={t.status === "terlambat" ? styles.badgeCoral : t.status === "terkumpul" ? styles.badgeTeal : styles.badgeYellow}>
                  {t.label || (t.status === "terlambat" ? "Terlambat" : t.status === "terkumpul" ? "Terkumpul" : "Belum dikumpulkan")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ulangan mendatang */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Ulangan &amp; Kuis Mendatang</h2>
          <div style={styles.list}>
            {ulanganMendatang.map((u) => (
              <div key={u.id} style={styles.item}>
                <div>
                  <div style={styles.itemTitle}>{u.judul}</div>
                  <div style={styles.itemMeta}>{u.mapel} · {u.waktu} · {u.durasi}</div>
                </div>
                <button style={styles.smallBtn} onClick={() => handleNavigate("/siswa/kuis")}>Lihat detail</button>
              </div>
            ))}
            {ulanganMendatang.length === 0 && (
              <p style={styles.emptyState}>Tidak ada ulangan dalam waktu dekat.</p>
            )}
          </div>
        </div>

        {/* Nilai terbaru */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Nilai Terbaru</h2>
          <div style={styles.list}>
            {nilaiTerbaru.map((n) => (
              <div key={n.id} style={styles.item}>
                <div>
                  <div style={styles.itemTitle}>{n.jenis}</div>
                  <div style={styles.itemMeta}>{n.mapel}</div>
                </div>
                <span style={styles.nilai}>{n.nilai}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const css = `
  :root{
    --ink:#16213E; --ink-soft:#3A4360; --muted:#5B6478;
    --bg:#F4F6FB; --surface:#FFFFFF; --border:#E2E6F0;
    --yellow:#FFC93C; --yellow-ink:#5C4300; --teal:#2FA88E; --teal-dark:#1F8E77; --coral:#FF6B6B;
  }
`;

const styles = {
  page: { background: "var(--bg)", minHeight: "100vh", padding: "32px", fontFamily: "Inter, system-ui, sans-serif" },
  header: { marginBottom: 28 },
  eyebrow: { fontSize: 13, color: "var(--muted)", margin: 0, fontWeight: 600 },
  title: { fontSize: 26, color: "var(--ink)", margin: "4px 0 0", fontFamily: "'Space Grotesk', sans-serif" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 },
  panel: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 },
  panelTitle: { fontSize: 15, color: "var(--ink)", marginBottom: 14, fontWeight: 700 },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  item: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px", borderRadius: 10, border: "1px solid var(--border)",
  },
  itemTitle: { fontSize: 14, fontWeight: 600, color: "var(--ink)" },
  itemMeta: { fontSize: 12.5, color: "var(--muted)", marginTop: 3 },
  badgeCoral: { fontSize: 11, fontWeight: 700, color: "#B23A3A", background: "rgba(255,107,107,0.14)", padding: "4px 8px", borderRadius: 999 },
  badgeYellow: { fontSize: 11, fontWeight: 700, color: "var(--yellow-ink)", background: "rgba(255,201,60,0.28)", padding: "4px 8px", borderRadius: 999 },
  badgeTeal: { fontSize: 11, fontWeight: 700, color: "var(--teal-dark)", background: "rgba(47,168,142,0.12)", padding: "4px 8px", borderRadius: 999 },
  smallBtn: { background: "var(--ink)", color: "#fff", border: "none", padding: "7px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, cursor: "pointer" },
  emptyState: { fontSize: 13.5, color: "var(--muted)" },
  nilai: { fontSize: 18, fontWeight: 700, color: "var(--teal-dark)", fontFamily: "'JetBrains Mono', monospace" },
};