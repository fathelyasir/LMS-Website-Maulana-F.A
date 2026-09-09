import React from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardGuru({ 
  namaGuru = "Bu Sari", 
  kelasSaya = [], 
  tugasPerluDinilai = [], 
  jadwalLive = [], 
  onNavigate 
}) {
  const navigate = useNavigate();
  const [kelasAktif, setKelasAktif] = React.useState(kelasSaya[0]?.id || "");

  const handleNavigate = (path) => {
    if (onNavigate) onNavigate(path);
    else navigate(path);
  };

  return (
    <div style={styles.page}>
      <style>{css}</style>

      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Dashboard Guru</p>
          <h1 style={styles.title}>Halo, {namaGuru} 👋</h1>
        </div>
        <button style={styles.primaryBtn} onClick={() => handleNavigate("/guru/tugas")}>+ Buat Tugas Baru</button>
      </header>

      <section style={styles.grid}>
        {/* Kolom kiri: daftar kelas */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Kelas Saya</h2>
          <div style={styles.list}>
            {kelasSaya.map((k) => (
              <button
                key={k.id}
                onClick={() => setKelasAktif(k.id)}
                style={{
                  ...styles.classItem,
                  ...(kelasAktif === k.id ? styles.classItemActive : {}),
                }}
              >
                <div>
                  <div style={styles.classItemName}>{k.nama}</div>
                  <div style={styles.classItemMeta}>{k.siswa} siswa</div>
                </div>
                {k.tugasBelumDinilai > 0 && (
                  <span style={styles.badgeCoral}>{k.tugasBelumDinilai} perlu dinilai</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Kolom tengah: tugas perlu dinilai */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Tugas Menunggu Penilaian</h2>
          <div style={styles.list}>
            {tugasPerluDinilai.map((t) => (
              <div key={t.id} style={styles.taskItem}>
                <div>
                  <div style={styles.classItemName}>{t.judul}</div>
                  <div style={styles.classItemMeta}>
                    {t.kelas} · {t.sudahMasuk}/{t.total} sudah mengumpulkan
                  </div>
                </div>
                <button style={styles.smallBtn} onClick={() => handleNavigate("/guru/tugas")}>Nilai</button>
              </div>
            ))}
            {tugasPerluDinilai.length === 0 && (
              <p style={styles.emptyState}>Semua tugas sudah dinilai. Kerja bagus!</p>
            )}
          </div>
        </div>

        {/* Kolom kanan: jadwal live class */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Live Class Terjadwal</h2>
          <div style={styles.list}>
            {jadwalLive.map((s) => (
              <div key={s.id} style={styles.taskItem}>
                <div>
                  <div style={styles.classItemName}>{s.judul}</div>
                  <div style={styles.classItemMeta}>
                    {s.kelas} · {s.waktu}
                  </div>
                </div>
                <span style={styles.badgeTeal}>{s.status}</span>
              </div>
            ))}
            <button style={styles.ghostBtn} onClick={() => handleNavigate("/guru/live")}>+ Jadwalkan Live Class</button>
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
    --yellow:#E7C979; --teal:#83C8B6; --teal-dark:#5BAA98; --coral:#DF918C;
  }
`;

const styles = {
  page: { background: "transparent", minHeight: "100vh", padding: "0", fontFamily: "var(--font-body)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 },
  eyebrow: { fontSize: 13, color: "var(--muted)", margin: 0, fontWeight: 600 },
  title: { fontSize: 30, color: "var(--ink)", margin: "4px 0 0", fontFamily: "var(--font-display)", letterSpacing: "-.04em" },
  primaryBtn: { background: "linear-gradient(135deg,var(--teal),#6BB5A4)", color: "#10211F", border: "none", padding: "12px 18px", borderRadius: 999, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 22px rgba(131,200,182,.14)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 },
  panel: { background: "linear-gradient(145deg,rgba(29,46,52,.92),rgba(19,32,38,.95))", border: "1px solid var(--border)", borderRadius: 20, padding: 22, boxShadow: "0 14px 34px rgba(0,0,0,.2)" },
  panelTitle: { fontSize: 15, color: "var(--ink)", marginBottom: 14, fontWeight: 700 },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  classItem: {
    display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%",
    padding: "13px", borderRadius: 12, borderWidth: 1, borderStyle: "solid", borderColor: "var(--border)", background: "rgba(7,13,28,.55)",
    cursor: "pointer", textAlign: "left",
  },
  classItemActive: { borderColor: "var(--teal)", boxShadow: "0 0 0 1px var(--teal) inset" },
  classItemName: { fontSize: 14, fontWeight: 600, color: "var(--ink)" },
  classItemMeta: { fontSize: 12.5, color: "var(--muted)", marginTop: 3 },
  taskItem: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "13px", borderRadius: 12, border: "1px solid var(--border)", background: "rgba(7,13,28,.4)",
  },
  badgeCoral: { fontSize: 11, fontWeight: 700, color: "#B23A3A", background: "rgba(255,107,107,0.14)", padding: "4px 8px", borderRadius: 999 },
  badgeTeal: { fontSize: 11, fontWeight: 700, color: "var(--teal-dark)", background: "rgba(47,168,142,0.12)", padding: "4px 8px", borderRadius: 999 },
  smallBtn: { background: "var(--ink)", color: "#fff", border: "none", padding: "7px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, cursor: "pointer" },
  ghostBtn: { background: "none", border: "1px dashed var(--border)", padding: "10px", borderRadius: 10, color: "var(--ink-soft)", fontWeight: 600, cursor: "pointer" },
  emptyState: { fontSize: 13.5, color: "var(--muted)" },
};