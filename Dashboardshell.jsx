// src/components/DashboardShell.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./Authcontext.jsx";

export default function DashboardShell({ navItems, children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={styles.shell}>
      <style>{responsiveCss}</style>
      <aside className={`kelasku-sidebar${mobileOpen ? " is-open" : ""}`} style={{ ...styles.sidebar, ...(mobileOpen ? styles.sidebarOpen : {}) }}>
        <Link to="/" style={styles.brand}>
          <span style={styles.brandMark} />
          Kelasku
        </Link>

        <nav style={styles.nav}>
          {navItems.map((item) => {
            const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{ ...styles.navItem, ...(active ? styles.navItemActive : {}) }}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={styles.userBox}>
          <div style={styles.userName}>{user?.nama}</div>
          <div style={styles.userRole}>
            {user?.peran === "guru" ? "Guru" : user?.peran === "siswa" ? "Siswa" : "Admin"}
            {user?.mapel ? ` · ${user.mapel}` : ""}
          </div>
          <button onClick={logout} style={styles.logoutBtn}>Keluar</button>
        </div>
      </aside>

      <button className="kelasku-mobile-toggle" style={styles.mobileToggle} onClick={() => setMobileOpen((v) => !v)} aria-label="Buka menu">
        ☰
      </button>

      <main className="kelasku-main" style={styles.main}>{children}</main>
    </div>
  );
}

const styles = {
  shell: { display: "flex", minHeight: "100vh", background: "var(--bg)" },
  sidebar: {
    width: 240, background: "var(--surface)", borderRight: "1px solid var(--border)",
    padding: "24px 18px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh",
    flex: "none",
  },
  sidebarOpen: {},
  brand: { display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 18, color: "var(--ink)", fontFamily: "var(--font-display)", marginBottom: 30 },
  brandMark: { width: 24, height: 24, borderRadius: 7, background: "linear-gradient(135deg, var(--teal), var(--ink))" },
  nav: { display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  navItem: { padding: "10px 12px", borderRadius: 10, fontSize: 14.5, fontWeight: 600, color: "var(--ink-soft)" },
  navItemActive: { background: "var(--bg)", color: "var(--ink)" },
  userBox: { borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 16 },
  userName: { fontSize: 14, fontWeight: 700, color: "var(--ink)" },
  userRole: { fontSize: 12.5, color: "var(--muted)", marginTop: 2 },
  logoutBtn: {
    marginTop: 12, width: "100%", padding: "9px", borderRadius: 10, border: "1px solid var(--border)",
    background: "none", color: "var(--coral-dark)", fontWeight: 600, fontSize: 13, cursor: "pointer",
  },
  mobileToggle: { display: "none" },
  main: { flex: 1, minWidth: 0, padding: "32px", maxWidth: 1200 },
};

const responsiveCss = `
  @media (max-width: 800px) {
    .kelasku-sidebar { position: fixed !important; left: 0; top: 0; bottom: 0; z-index: 20; transform: translateX(-100%); transition: transform .2s ease; }
    .kelasku-sidebar.is-open { transform: translateX(0); }
    .kelasku-mobile-toggle { display: block !important; position: fixed; top: 14px; left: 14px; z-index: 30; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); color: var(--ink); padding: 8px 11px; font-size: 18px; }
    .kelasku-main { padding-top: 64px !important; }
  }
`;