// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import * as db from "./Db.js";

const SESSION_KEY = "kelasku_session_v1";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  function loginUser(identifier, password, role) {
    const found = db.login(identifier, password);
    if (!found) return { ok: false, message: "Identitas atau kata sandi salah. Periksa kembali." };
    if (role && found.peran !== role) return { ok: false, message: "Peran yang dipilih tidak sesuai dengan akun tersebut." };
    setUser(found);
    localStorage.setItem(SESSION_KEY, JSON.stringify(found));
    return { ok: true, user: found };
  }

  function registerSiswa(payload) {
    try {
      const created = db.registerSiswa(payload);
      setUser(created);
      localStorage.setItem(SESSION_KEY, JSON.stringify(created));
      return { ok: true, user: created };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, registerSiswa, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}