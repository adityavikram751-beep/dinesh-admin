"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import Image from "next/image";

import type { ReactNode } from "react";

import {
  useEffect,
  useState,
} from "react";

import { notifications } from "../data";

import { icons } from "./Icons";

// ================= CONSTANTS =================

const storageKey =
  "fitadmin_logged_in";

const tokenKey =
  "fitadmin_token";

const BASE_URL =
  "https://dinesh-sagel-backend.onrender.com";

// ================= TYPES =================

type IconName =
  keyof typeof icons;

type Route = [
  href: string,
  label: string,
  icon: IconName
];

type User = {
  name: string;
  email: string;
  gym: string;
  profilePicture: string;
};

// ================= ROUTES =================

const routes: Route[] = [
  [
    "/dashboard",
    "Dashboard",
    "Home",
  ],

  [
    "/enquiry",
    "Enquiry",
    "Inbox",
  ],

  [
    "/contact",
    "Contact",
    "Phone",
  ],

  [
    "/blog",
    "Blog",
    "Newspaper",
  ],

  [
    "/settings",
    "Settings",
    "Settings",
  ],

  [
    "/gym-plan",
    "Gym Plan",
    "List",
  ],
];

// ================= TITLES =================

const titles: Record<
  string,
  [string, string]
> = {
  "/dashboard": [
    "Dashboard",
    "Today's studio performance and member activity.",
  ],

  "/enquiry": [
    "Enquiry",
    "Capture leads and follow up.",
  ],

  "/contact": [
    "Contact",
    "Manage contact details.",
  ],

  "/blog": [
    "Blog",
    "Latest fitness tips and updates.",
  ],

  "/settings": [
    "Settings",
    "Manage profile and preferences.",
  ],

  "/gym-plan": [
    "Gym Plan",
    "Manage gym plans.",
  ],
};

// ================= COMPONENT =================

export default function AdminShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname =
    usePathname();

  const router =
    useRouter();

  // ================= STATES =================

  const [ready, setReady] =
    useState(false);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [
    notificationOpen,
    setNotificationOpen,
  ] = useState(false);

  // ================= USER =================

  const [user, setUser] =
    useState<User>({
      name: "Admin",
      email:
        "admin@fitstudio.com",
      gym: "Dinesh sehgal",
      profilePicture: "",
    });

  // ================= LOAD =================

  useEffect(() => {
    if (
      localStorage.getItem(
        storageKey
      ) !== "true"
    ) {
      router.replace("/login");

      return;
    }

    loadProfile();

    // ================= LIVE PROFILE UPDATE =================

    window.addEventListener(
      "profileUpdated",
      loadProfile
    );

    setReady(true);

    return () => {
      window.removeEventListener(
        "profileUpdated",
        loadProfile
      );
    };
  }, [router]);

  // ================= LOAD PROFILE =================

  async function loadProfile() {
    try {
      const token =
        localStorage.getItem(
          tokenKey
        );

      const response =
        await fetch(
          `${BASE_URL}/api/admin/auth/profile`,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
            },

            cache: "no-store",
          }
        );

      const data =
        await response.json();

      console.log(
        "NAVBAR PROFILE =>",
        data
      );

      if (data?.success) {
        setUser({
          name:
            data.admin
              ?.username ||
            "Admin",

          email:
            data.admin?.email ||
            "",

          gym:
            localStorage.getItem(
              "fitadmin_gym"
            ) ||
            "Dinesh sehgal",

          profilePicture:
            data.admin
              ?.profilePicture ||
            "",
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  // ================= LOGOUT =================

  function handleLogout() {
    localStorage.clear();

    router.push("/logout");
  }

  // ================= LOADING =================

  if (!ready) {
    return null;
  }

  // ================= PAGE TITLE =================

  const [heading] =
    titles[pathname] ||
    titles["/dashboard"];

  // ================= UI =================

  return (
    <div className="app-shell">
      {/* ================= SIDEBAR ================= */}

      <aside
        className={`sidebar ${
          menuOpen
            ? "open"
            : ""
        }`}
      >
        <div className="brand">
          <span>
            {user.gym}
          </span>
        </div>

        {/* ================= NAVIGATION ================= */}

        <nav className="nav">
          {routes.map(
            ([
              href,
              label,
              icon,
            ]) => (
              <Link
                className={
                  pathname === href
                    ? "active"
                    : ""
                }
                href={href}
                key={href}
                onClick={() =>
                  setMenuOpen(
                    false
                  )
                }
              >
                {
                  icons[
                    icon
                  ]
                }

                {label}
              </Link>
            )
          )}
        </nav>

        {/* ================= LOGOUT ================= */}

        <div className="sidebar-footer">
          <button
            className="danger-btn"
            onClick={
              handleLogout
            }
            type="button"
          >
            {icons.LogOut}

            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}

      <main className="main">
        {/* ================= TOPBAR ================= */}

        <header className="topbar">
          <div className="page-title">
            <button
              className="icon-btn mobile-menu"
              onClick={() =>
                setMenuOpen(
                  true
                )
              }
              type="button"
              aria-label="Open menu"
            >
              {icons.Menu}
            </button>

            <div>
              <h1>
                {heading}
              </h1>
            </div>
          </div>

          {/* ================= ACTIONS ================= */}

          <div className="topbar-actions">
            {/* SEARCH */}

            <div className="search-box header-search">
              <input
                aria-label="Search"
                placeholder="Search..."
              />
            </div>

            {/* DATE */}

            <span className="header-date">
              May 14, 2026
            </span>

            {/* NOTIFICATIONS */}

            <div className="notification-wrap">
              <button
                className="icon-btn notification-btn"
                onClick={() =>
                  setNotificationOpen(
                    (
                      current
                    ) =>
                      !current
                  )
                }
                type="button"
                aria-label="Open notifications"
              >
                {icons.Bell}

                <span className="notification-dot">
                  {
                    notifications.length
                  }
                </span>
              </button>

              {notificationOpen && (
                <NotificationMenu />
              )}
            </div>

            {/* ================= PROFILE ================= */}

            <Link
              className="profile"
              href="/settings"
              title={user.email}
            >
              <Image
                src={
                  user.profilePicture
                    ? `${user.profilePicture}?t=${new Date().getTime()}`
                    : "https://ui-avatars.com/api/?name=Admin"
                }
                alt={user.name}
                width={48}
                height={48}
                className="avatar-img"
                unoptimized
                key={
                  user.profilePicture
                }
              />

              <span className="profile-copy">
                <strong>
                  {user.name}
                </strong>

                <small>
                  Admin
                </small>
              </span>
            </Link>
          </div>
        </header>

        {/* ================= PAGE CONTENT ================= */}

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}

// ================= NOTIFICATION MENU =================

function NotificationMenu() {
  return (
    <div className="notification-menu">
      <div className="notification-head">
        <strong>
          Notifications
        </strong>

        <span>
          {
            notifications.length
          }{" "}
          new
        </span>
      </div>

      <div className="notification-list">
        {notifications.map(
          (item) => (
            <div
              className="notification-item"
              key={
                item.title
              }
            >
              <div>
                <strong>
                  {
                    item.title
                  }
                </strong>

                <p>
                  {item.body}
                </p>
              </div>

              <span>
                {item.time}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}