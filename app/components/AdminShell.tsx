"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { icons } from "./Icons";

// ================= CONSTANTS =================

const storageKey = "fitadmin_logged_in";
const tokenKey = "fitadmin_token";
const authCookieKey = "fitadmin_auth";
const BASE_URL = "https://dinesh-sagel-backend.onrender.com";

function normalizeToken(token: string | null) {
  if (!token || token === "null" || token === "undefined") return null;
  const trimmed = token.trim();
  return trimmed ? trimmed : null;
}

const NOTIFICATION_VOICE_MESSAGE = "दिनेश सहगल, आपका नोटिफिकेशन आया है।";
const NOTIFICATION_VOICE_LANGUAGE = "hi-IN";
const NOTIFICATION_VOICE_RATE = 0.92;

// ================= TYPES =================

type IconName = keyof typeof icons;
type Route = [href: string, label: string, icon: IconName];
type User = { name: string; email: string; gym: string; profilePicture: string };
type NotificationType = { title: string; body: string; time: string };

// ================= ROUTES =================

const routes: Route[] = [
  ["/enquiry", "Enquiry", "Inbox"],
  ["/contact", "Contact", "Phone"],
  ["/blog", "Blog", "Newspaper"],
  ["/settings", "Settings", "Settings"],
  ["/gym-plan", "Gym Plan", "List"],
  ["/banner", "Banner", "Image"],
  ["/payment-details", "Payment Details", "Payment"],
];

// ================= TITLES =================

const titles: Record<string, [string, string]> = {
  "/enquiry": ["Enquiry", "Capture leads and follow up."],
  "/contact": ["Contact", "Manage contact details."],
  "/blog": ["Blog", "Latest fitness tips and updates."],
  "/settings": ["Settings", "Manage profile and preferences."],
  "/gym-plan": ["Gym Plan", "Manage gym plans."],
  "/banner": ["Banner", "Manage banner images."],
  "/payment-details": ["Payment Details", "Manage payment information."],
};

// ================= COMPONENT =================

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [user, setUser] = useState<User>({
    name: "Admin",
    email: "admin@fitstudio.com",
    gym: "Dinesh sehgal",
    profilePicture: "",
  });

  // ================= SOCKET IO =================

  useEffect(() => {
    const token = normalizeToken(localStorage.getItem(tokenKey));
    if (!token) return;

    function announceNotification() {
      if (!("speechSynthesis" in window)) return;
      const announcement = new SpeechSynthesisUtterance(NOTIFICATION_VOICE_MESSAGE);
      const selectedVoice = window.speechSynthesis.getVoices().find((v) => v.lang === NOTIFICATION_VOICE_LANGUAGE);
      announcement.lang = NOTIFICATION_VOICE_LANGUAGE;
      announcement.rate = NOTIFICATION_VOICE_RATE;
      announcement.volume = 1;
      if (selectedVoice) announcement.voice = selectedVoice;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(announcement);
    }

    const socket = io("https://dinesh-sagel-backend.onrender.com", {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => console.log("✅ Socket Connected", socket.id));
    socket.on("new_enquiry", (data) => {
      const enquiry = data.enquiry;
      announceNotification();
      setNotifications((prev) => [
        { title: enquiry.name, body: enquiry.message, time: new Date().toLocaleTimeString() },
        ...prev,
      ]);
    });
    socket.on("disconnect", () => console.log("🔴 Socket Disconnected"));
    socket.on("connect_error", (error) => console.log("❌ Socket Error =>", error.message));

    return () => {
      socket.disconnect();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  // ================= LOAD =================

  useEffect(() => {
    if (localStorage.getItem(storageKey) !== "true") {
      router.replace("/login");
      return;
    }
    loadProfile();
    window.addEventListener("profileUpdated", loadProfile);
    setReady(true);
    return () => window.removeEventListener("profileUpdated", loadProfile);
  }, [router]);

  async function loadProfile() {
    try {
      const token = normalizeToken(localStorage.getItem(tokenKey));
      if (!token) return;
      const response = await fetch(`${BASE_URL}/api/admin/auth/profile`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await response.json();
      if (data?.success) {
        setUser({
          name: data.admin?.username || "Admin",
          email: data.admin?.email || "",
          gym: localStorage.getItem("fitadmin_gym") || "Dinesh sehgal",
          profilePicture: data.admin?.profilePicture || "",
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  function handleLogout() {
    localStorage.clear();
    document.cookie = `${authCookieKey}=; path=/; max-age=0; SameSite=Lax`;
    router.push("/logout");
  }

  if (!ready) return null;

  const [heading] = titles[pathname] || titles["/enquiry"];
  const currentDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .app-shell {
          display: flex;
          min-height: 100vh;
          background: #f4f6fb;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        /* ===== OVERLAY (mobile) ===== */
        .overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 99;
        }
        .overlay.show { display: block; }

        /* ===== SIDEBAR ===== */
        .sidebar {
          width: 240px;
          min-height: 100vh;
          background: #111827;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          z-index: 100;
          transition: transform 0.26s ease;
        }

        .brand {
          padding: 24px 20px 18px;
          font-size: 17px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.3px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 14px 12px;
          gap: 4px;
        }

        .nav a {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          color: #9ca3af;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }

        .nav a svg { width: 18px; height: 18px; flex-shrink: 0; }

        .nav a:hover { background: rgba(255,255,255,0.07); color: #fff; }

        .nav a.active {
          background: #312e81;
          color: #fff;
          font-weight: 700;
        }

        .sidebar-footer {
          padding: 14px 12px 20px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .danger-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(239,68,68,0.12);
          color: #f87171;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }

        .danger-btn svg { width: 18px; height: 18px; }
        .danger-btn:hover { background: rgba(239,68,68,0.22); }

        /* ===== MAIN ===== */
        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        /* ===== TOPBAR ===== */
        .topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: nowrap;
          padding: 0 24px;
          height: 64px;
          min-height: 64px;
          background: #fff;
          border-bottom: 1px solid #e8edf5;
          gap: 8px;
        }

        /* LEFT side — hamburger + page title */
        .topbar-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }

        .topbar-heading {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
        }

        /* RIGHT side — date + bell + profile ALWAYS together */
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          flex-wrap: nowrap;
        }

        .header-date {
          font-size: 12px;
          color: #94a3b8;
          font-weight: 500;
          white-space: nowrap;
        }

        /* Icon buttons */
        .icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: none;
          background: #f1f5f9;
          color: #475569;
          cursor: pointer;
          transition: background 0.15s;
          flex-shrink: 0;
        }

        .icon-btn svg { width: 18px; height: 18px; }
        .icon-btn:hover { background: #e2e8f0; }

        /* Mobile menu button — hidden on desktop */
        .mobile-menu { display: none; }

        /* Notification */
        .notification-wrap { position: relative; }

        .notification-btn { position: relative; }

        .notification-dot {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #fff;
        }

        .notification-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 320px;
          background: #fff;
          border: 1px solid #e8edf5;
          border-radius: 14px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
          z-index: 200;
          overflow: hidden;
        }

        .notification-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 13px;
          color: #0f172a;
        }

        .notification-head span { color: #94a3b8; font-size: 12px; }

        .notification-list { max-height: 340px; overflow-y: auto; }

        .notification-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          border-bottom: 1px solid #f8fafc;
          font-size: 13px;
        }

        .notification-item strong { display: block; color: #0f172a; font-size: 13px; margin-bottom: 3px; }
        .notification-item p { color: #64748b; font-size: 12px; margin: 0; line-height: 1.5; }
        .notification-item span { color: #94a3b8; font-size: 11px; white-space: nowrap; flex-shrink: 0; }

        /* Profile */
        .profile {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          padding: 4px 8px 4px 4px;
          border-radius: 12px;
          transition: background 0.15s;
          flex-shrink: 0;
        }

        .profile:hover { background: #f1f5f9; }

        .avatar-img {
          width: 36px !important;
          height: 36px !important;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e8edf5;
          flex-shrink: 0;
        }

        .profile-name { display: flex; flex-direction: column; line-height: 1.3; }
        .profile-name strong { font-size: 13px; color: #0f172a; font-weight: 700; }
        .profile-name small { font-size: 11px; color: #94a3b8; }

        /* ===== PAGE CONTENT ===== */
        .page-content {
          flex: 1;
          padding: 24px;
          overflow-x: hidden;
        }

        /* ===== RESPONSIVE ===== */

        /* Tablet */
        @media (max-width: 1024px) {
          .sidebar { width: 200px; }
          .header-date { display: none; }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: 260px;
            transform: translateX(-100%);
            z-index: 200;
          }

          .sidebar.open { transform: translateX(0); }

          .mobile-menu { display: flex !important; }

          .topbar {
            padding: 0 12px;
            height: 56px;
            min-height: 56px;
            gap: 6px;
          }

          .topbar-heading { font-size: 15px; }

          /* Bell + avatar stay together on right, hamburger on left */
          .topbar-left { gap: 8px; }
          .topbar-right { gap: 6px; }

          .profile-name { display: none; }

          .profile { padding: 3px; border-radius: 50%; }

          .page-content { padding: 14px; }

          .notification-menu {
            position: fixed;
            top: 62px;
            left: 12px;
            right: 12px;
            width: auto;
          }

          .header-date { display: none; }

          .icon-btn { width: 34px; height: 34px; border-radius: 8px; }

          .avatar-img { width: 32px !important; height: 32px !important; }
        }

        @media (max-width: 480px) {
          .page-content { padding: 12px; }
          .topbar { padding: 0 12px; }
        }
      `}</style>

      <div className="app-shell">

        {/* OVERLAY — mobile sidebar ke peeche */}
        <div
          className={`overlay ${menuOpen ? "show" : ""}`}
          onClick={() => setMenuOpen(false)}
        />

        {/* SIDEBAR */}
        <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
          <div className="brand">{user.gym}</div>

          <nav className="nav">
            {routes.map(([href, label, icon]) => (
              <Link
                key={href}
                href={href}
                className={pathname === href ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                {icons[icon]}
                {label}
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="danger-btn" onClick={handleLogout} type="button">
              {icons.LogOut}
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">

          {/* TOPBAR */}
          <header className="topbar">

            {/* LEFT — hamburger + title */}
            <div className="topbar-left">
              <button
                className="icon-btn mobile-menu"
                onClick={() => setMenuOpen(true)}
                type="button"
              >
                {icons.Menu}
              </button>
              <h1 className="topbar-heading">{heading}</h1>
            </div>

            {/* RIGHT — date + bell + avatar always together */}
            <div className="topbar-right">
              <span className="header-date">{currentDate}</span>

              {/* NOTIFICATIONS */}
              <div className="notification-wrap">
                <button
                  className="icon-btn notification-btn"
                  onClick={() => setNotificationOpen((c) => !c)}
                  type="button"
                >
                  {icons.Bell}
                  <span className="notification-dot">{notifications.length}</span>
                </button>
                {notificationOpen && <NotificationMenu notifications={notifications} />}
              </div>

              {/* PROFILE */}
              <Link className="profile" href="/settings">
                <Image
                  src={
                    user.profilePicture
                      ? `${user.profilePicture}?t=${new Date().getTime()}`
                      : "https://ui-avatars.com/api/?name=Admin"
                  }
                  alt={user.name}
                  width={36}
                  height={36}
                  className="avatar-img"
                  unoptimized
                />
                <span className="profile-name">
                  <strong>{user.name}</strong>
                  <small>Admin</small>
                </span>
              </Link>
            </div>

          </header>

          {/* PAGE CONTENT */}
          <div className="page-content">{children}</div>
        </main>
      </div>
    </>
  );
}

// ================= NOTIFICATION MENU =================

function NotificationMenu({ notifications }: { notifications: NotificationType[] }) {
  return (
    <div className="notification-menu">
      <div className="notification-head">
        <strong>Notifications</strong>
        <span>{notifications.length} new</span>
      </div>
      <div className="notification-list">
        {notifications.length === 0 ? (
          <div style={{ padding: "20px 16px", color: "#94a3b8", fontSize: 13, textAlign: "center" }}>
            No notifications yet
          </div>
        ) : (
          notifications.map((item, index) => (
            <div className="notification-item" key={index}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </div>
              <span>{item.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}