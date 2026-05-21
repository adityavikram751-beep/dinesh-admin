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

import { io } from "socket.io-client";

import { icons } from "./Icons";

// ================= CONSTANTS =================

const storageKey =
  "fitadmin_logged_in";

const tokenKey =
  "fitadmin_token";

const authCookieKey =
  "fitadmin_auth";

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

type NotificationType = {
  title: string;
  body: string;
  time: string;
};

// ================= ROUTES =================

const routes: Route[] = [
 
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

  [
    "/banner",
    "Banner",
    "Image",
  ],
];

// ================= TITLES =================

const titles: Record<
  string,
  [string, string]
> = {


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

  "/banner": [
    "Banner",
    "Manage banner images.",
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

  // ================= NOTIFICATIONS =================

  const [
    notifications,
    setNotifications,
  ] = useState<
    NotificationType[]
  >([]);

  // ================= USER =================

  const [user, setUser] =
    useState<User>({
      name: "Admin",
      email:
        "admin@fitstudio.com",
      gym: "Dinesh sehgal",
      profilePicture: "",
    });

  // ================= SOCKET IO =================

  useEffect(() => {

    const token =
      localStorage.getItem(
        tokenKey
      );

    console.log(
      "TOKEN =>",
      token
    );

    // SOCKET CONNECTION

    const socket = io(
      "https://dinesh-sagel-backend.onrender.com",
      {

        auth: {
          token,
        },

        transports: [
          "websocket",
        ],
      }
    );

    // CONNECTED

    socket.on(
      "connect",
      () => {

        console.log(
          "✅ Socket Connected"
        );

        console.log(
          "SOCKET ID =>",
          socket.id
        );
      }
    );

    // REALTIME ENQUIRY

    socket.on(
      "new_enquiry",
      (data) => {

        console.log(
          "📩 New Enquiry =>",
          data
        );

        const enquiry =
          data.enquiry;

        setNotifications(
          (prev) => [

            {
              title:
                enquiry.name,

              body:
                enquiry.message,

              time:
                new Date().toLocaleTimeString(),
            },

            ...prev,
          ]
        );
      }
    );

    // DISCONNECT

    socket.on(
      "disconnect",
      () => {

        console.log(
          "🔴 Socket Disconnected"
        );
      }
    );

    // ERROR

    socket.on(
      "connect_error",
      (error) => {

        console.log(
          "❌ Socket Error =>",
          error.message
        );
      }
    );

    // CLEANUP

    return () => {

      socket.disconnect();
    };

  }, []);

  // ================= LOAD =================

  useEffect(() => {

    if (
      localStorage.getItem(
        storageKey
      ) !== "true"
    ) {

      router.replace(
        "/login"
      );

      return;
    }

    loadProfile();

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

    document.cookie =
      `${authCookieKey}=; path=/; max-age=0; SameSite=Lax`;

    router.push(
      "/logout"
    );
  }

  // ================= LOADING =================

  if (!ready) {
    return null;
  }

  // ================= TITLE =================

  const [heading] =
    titles[pathname] ||
    titles["/d"];

  const currentDate =
    new Date().toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );

  // ================= UI =================

  return (

    <div className="app-shell">

      {/* SIDEBAR */}

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

        {/* NAVIGATION */}

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

        {/* LOGOUT */}

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

      {/* MAIN */}

      <main className="main">

        {/* TOPBAR */}

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
            >

              {icons.Menu}

            </button>

            <div>

              <h1>
                {heading}
              </h1>

            </div>

          </div>

          {/* ACTIONS */}

          <div className="topbar-actions">

            

            <span className="header-date">
              {currentDate}
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
              >

                {icons.Bell}

                <span className="notification-dot">

                  {
                    notifications.length
                  }

                </span>

              </button>

              {notificationOpen && (

                <NotificationMenu
                  notifications={
                    notifications
                  }
                />

              )}

            </div>

            {/* PROFILE */}

            <Link
              className="profile"
              href="/settings"
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

        {/* PAGE CONTENT */}

        <div className="page-content">
          {children}
        </div>

      </main>

    </div>
  );
}

// ================= NOTIFICATION MENU =================

function NotificationMenu({
  notifications,
}: {
  notifications: NotificationType[];
}) {

  return (

    <div className="notification-menu">

      <div className="notification-head">

        <strong>
          Notifications
        </strong>

        <span>
          {
            notifications.length
          } new
        </span>

      </div>

      <div className="notification-list">

        {notifications.map(
          (
            item,
            index
          ) => (

            <div
              className="notification-item"
              key={index}
            >

              <div>

                <strong>
                  {item.title}
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