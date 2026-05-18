"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

const storageKey = "fitadmin_logged_in";
const tokenKey = "fitadmin_token";

export default function LogoutPage() {
  const [message, setMessage] = useState("Closing your admin session...");

  useEffect(() => {
    async function logout() {
      const token = localStorage.getItem(tokenKey);

      try {
        await apiRequest("/api/admin/auth/logout", {
          method: "POST",
          token
        });
        setMessage("Your admin session has been closed successfully.");
      } catch {
        setMessage("Local session closed. Server logout could not be confirmed.");
      } finally {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(tokenKey);
      }
    }

    logout();
  }, []);

  return (
    <div className="logout-shell">
      <div className="auth-card logout-card">
        <div className="brand logout-brand">
          <span>Dinesh sehgal</span>
        </div>
        <h2>Logged out</h2>
        <p>{message}</p>
        <Link className="primary-btn auth-link-btn" href="/login">Login Again</Link>
      </div>
    </div>
  );
}
