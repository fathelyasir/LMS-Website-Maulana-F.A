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
              <div key={`${n.jenis}-${n.id}`} style={styles.item}>
                <div>
                  <div style={styles.itemTitle}>{n.judul}</div>
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
    --ink:#E7F0ED; --ink-soft:#B5C7C2; --muted:#82958F;
    --bg:#0E171C; --surface:#162329; --border:rgba(174,205,196,.16);
    --yellow:#E7C979; --yellow-ink:#443A1F; --teal:#83C8B6; --teal-dark:#5BAA98; --coral:#DF918C;
  }
`;

const styles = {
  page: { background: "transparent", minHeight: "100vh", padding: "0", fontFamily: "var(--font-body)" },
  header: { marginBottom: 28 },
  eyebrow: { fontSize: 13, color: "var(--muted)", margin: 0, fontWeight: 600 },
  title: { fontSize: 30, color: "var(--ink)", margin: "4px 0 0", fontFamily: "var(--font-display)", letterSpacing: "-.04em" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 },
  panel: { background: "linear-gradient(145deg,rgba(29,46,52,.92),rgba(19,32,38,.95))", border: "1px solid var(--border)", borderRadius: 20, padding: 22, boxShadow: "0 14px 34px rgba(0,0,0,.2)" },
  panelTitle: { fontSize: 15, color: "var(--ink)", marginBottom: 14, fontWeight: 700 },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  item: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "13px", borderRadius: 12, border: "1px solid var(--border)", background: "rgba(7,13,28,.4)",
  },
  itemTitle: { fontSize: 14, fontWeight: 600, color: "var(--ink)" },
  itemMeta: { fontSize: 12.5, color: "var(--muted)", marginTop: 3 },
  badgeCoral: { fontSize: 11, fontWeight: 700, color: "#B23A3A", background: "rgba(255,107,107,0.14)", padding: "4px 8px", borderRadius: 999 },
  badgeYellow: { fontSize: 11, fontWeight: 700, color: "var(--yellow-ink)", background: "rgba(255,201,60,0.28)", padding: "4px 8px", borderRadius: 999 },
  badgeTeal: { fontSize: 11, fontWeight: 700, color: "var(--teal-dark)", background: "rgba(47,168,142,0.12)", padding: "4px 8px", borderRadius: 999 },
  smallBtn: { background: "var(--ink)", color: "#fff", border: "none", padding: "7px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, cursor: "pointer" },
  emptyState: { fontSize: 13.5, color: "var(--muted)" },
  nilai: { fontSize: 18, fontWeight: 700, color: "var(--teal)", fontFamily: "var(--font-mono)", textShadow: "0 0 14px var(--glow-teal)" },
};