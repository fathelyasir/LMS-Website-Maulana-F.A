// src/components/DashboardShell.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./Authcontext.jsx";
import logoKelasku from "./assets/logo-kelasku.png";

export default function DashboardShell({ navItems, children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={styles.shell}>
      <style>{responsiveCss}</style>
      <aside className={`kelasku-sidebar${mobileOpen ? " is-open" : ""}`} style={{ ...styles.sidebar, ...(mobileOpen ? styles.sidebarOpen : {}) }}>
        <Link to="/" style={styles.brand}>
          <img src={logoKelasku} alt="Kelasku" style={styles.brandLogo} />
          <span>Kelasku</span>
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
        {mobileOpen ? "×" : "☰"}
      </button>
      {mobileOpen && <button className="kelasku-menu-backdrop" onClick={() => setMobileOpen(false)} aria-label="Tutup menu" />}

      <main className="kelasku-main" style={styles.main}>{children}</main>
    </div>
  );
}

const styles = {
  shell: { display: "flex", minHeight: "100vh", background: "transparent" },
  sidebar: {
    width: 258, background: "rgba(10,17,33,.78)", borderRight: "1px solid var(--border)",
    padding: "28px 18px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh",
    backdropFilter: "blur(22px)",
    flex: "none",
  },
  sidebarOpen: {},
  brand: { display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 18, color: "var(--ink)", fontFamily: "var(--font-display)", marginBottom: 30 },
  brandLogo: { width: 34, height: 34, objectFit: "contain", borderRadius: 8 },
  nav: { display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  navItem: { padding: "11px 13px", borderRadius: 12, fontSize: 14.5, fontWeight: 600, color: "var(--ink-soft)", transition: "all .2s ease" },
  navItemActive: { background: "linear-gradient(90deg, rgba(131,200,182,.14), rgba(169,165,197,.07))", color: "var(--teal)", boxShadow: "inset 3px 0 var(--teal)" },
  userBox: { borderTop: "1px solid var(--border)", paddingTop: 18, marginTop: 16 },
  userName: { fontSize: 14, fontWeight: 700, color: "var(--ink)" },
  userRole: { fontSize: 12.5, color: "var(--muted)", marginTop: 2 },
  logoutBtn: {
    marginTop: 12, width: "100%", padding: "10px", borderRadius: 10, border: "1px solid rgba(255,120,146,.25)",
    background: "rgba(255,120,146,.05)", color: "var(--coral)", fontWeight: 600, fontSize: 13, cursor: "pointer",
  },
  mobileToggle: { display: "none" },
  main: { flex: 1, minWidth: 0, padding: "38px", maxWidth: 1280 },
};

const responsiveCss = `
  @media (max-width: 800px) {
    .kelasku-sidebar { position: fixed !important; left: 0; top: 0; bottom: 0; z-index: 20; transform: translateX(-100%); transition: transform .2s ease; }
    .kelasku-sidebar.is-open { transform: translateX(0); }
    .kelasku-mobile-toggle { display: block !important; position: fixed; top: 14px; left: 14px; z-index: 31; border: 1px solid var(--border); border-radius: 12px; background: rgba(17,26,46,.92); color: var(--teal); padding: 7px 12px; font-size: 20px; line-height:1; box-shadow:0 8px 24px rgba(0,0,0,.22); }
    .kelasku-menu-backdrop { display:block; position:fixed; inset:0; z-index:19; border:0; background:rgba(3,7,16,.58); backdrop-filter:blur(3px); }
    .kelasku-main { padding-top: 64px !important; }
  }
`;