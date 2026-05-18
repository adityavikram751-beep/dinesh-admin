"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import AdminShell from "../components/AdminShell";

// ================= TYPES =================

type User = {
  username: string;
  email: string;
  profilePicture?: string;
};

// ================= CONSTANTS =================

const BASE_URL =
  "https://dinesh-sagel-backend.onrender.com";

const tokenKey =
  "fitadmin_token";

// ================= PAGE =================

export default function SettingsPage() {
  const [toast, setToast] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [user, setUser] =
    useState<User>({
      username: "",
      email: "",
      profilePicture: "",
    });

  // ================= FILE =================

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  // ================= LOAD PROFILE =================

  useEffect(() => {
    loadProfile();
  }, []);

  // ================= GET PROFILE =================

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
          }
        );

      const data =
        await response.json();

      console.log(
        "PROFILE =>",
        data
      );

      if (data?.success) {
        setUser({
          username:
            data.admin?.username ||
            "",

          email:
            data.admin?.email ||
            "",

          profilePicture:
            data.admin
              ?.profilePicture ||
            "",
        });
      }
    } catch (error) {
      console.log(error);

      showToast(
        "Failed to load profile"
      );
    }
  }

  // ================= TOAST =================

  function showToast(
    message: string
  ) {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2000);
  }

  // ================= IMAGE =================

  function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    // ================= SAVE FILE =================

    setSelectedFile(file);

    // ================= PREVIEW =================

    const imageUrl =
      URL.createObjectURL(file);

    setUser((current) => ({
      ...current,
      profilePicture: imageUrl,
    }));

    showToast(
      "Image selected"
    );
  }

  // ================= UPDATE PROFILE =================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setLoading(true);

      // ================= TOKEN =================

      const token =
        localStorage.getItem(
          tokenKey
        );

      // ================= FORM DATA =================

      const formData =
        new FormData();

      formData.append(
        "username",
        user.username
      );

      formData.append(
        "email",
        user.email
      );

      // ================= FILE =================

      if (selectedFile) {
        formData.append(
          "profileImage",
          selectedFile
        );
      }

      // ================= API =================

      const response =
        await fetch(
          `${BASE_URL}/api/admin/auth/profile`,
          {
            method: "PUT",

            headers: {
              Authorization: `Bearer ${token}`,
            },

            body: formData,
          }
        );

      const data =
        await response.json();

      console.log(
        "UPDATE RESPONSE =>",
        data
      );

      // ================= ERROR =================

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Update failed"
        );
      }

      // ================= UPDATE UI =================

      setUser({
        username:
          data.admin.username,

        email:
          data.admin.email,

        profilePicture:
          data.admin
            .profilePicture,
      });

      // ================= NAVBAR UPDATE =================

      window.dispatchEvent(
        new Event(
          "profileUpdated"
        )
      );

      // ================= CLEAR FILE =================

      setSelectedFile(null);

      // ================= TOAST =================

      showToast(
        data?.message ||
          "Profile updated successfully"
      );
    } catch (error) {
      console.log(error);

      showToast(
        error instanceof Error
          ? error.message
          : "Server error"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell>
      <form
        onSubmit={handleSubmit}
        style={{
          padding: "30px",
          borderRadius: "24px",
          background: "#fff",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.06)",
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        {/* ================= TITLE ================= */}

        <h2
          style={{
            fontSize: "30px",
            marginBottom: "24px",
            fontWeight: "700",
            color: "#111827",
          }}
        >
          Admin Settings
        </h2>

        {/* ================= PROFILE IMAGE ================= */}

        <div
          style={{
            marginBottom: "24px",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom:
                "10px",
              fontWeight: "600",
            }}
          >
            Profile Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={
              handleImageUpload
            }
          />

          {/* ================= IMAGE PREVIEW ================= */}

          <div
            style={{
              marginTop: "18px",
            }}
          >
            <img
              src={
                user.profilePicture?.trim()
                  ? user.profilePicture
                  : "https://ui-avatars.com/api/?name=Admin"
              }
              alt="profile"
              onError={(e) => {
                e.currentTarget.src =
                  "https://ui-avatars.com/api/?name=Admin";
              }}
              style={{
                width: "140px",
                height: "140px",
                objectFit:
                  "cover",
                borderRadius:
                  "18px",
                border:
                  "2px solid #eee",
              }}
            />
          </div>
        </div>

        {/* ================= FORM ================= */}

        <div
          style={{
            display: "grid",
            gap: "24px",
          }}
        >
          {/* USERNAME */}

          <label
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: "10px",
            }}
          >
            <span
              style={{
                fontWeight: "600",
              }}
            >
              Username
            </span>

            <input
              required
              value={
                user.username
              }
              onChange={(
                event
              ) =>
                setUser(
                  (
                    current
                  ) => ({
                    ...current,

                    username:
                      event.target
                        .value,
                  })
                )
              }
              style={{
                height: "52px",
                borderRadius:
                  "14px",
                border:
                  "1px solid #d1d5db",
                padding:
                  "0 16px",
                fontSize: "15px",
              }}
            />
          </label>

          {/* EMAIL */}

          <label
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: "10px",
            }}
          >
            <span
              style={{
                fontWeight: "600",
              }}
            >
              Email
            </span>

            <input
              required
              type="email"
              value={user.email}
              onChange={(
                event
              ) =>
                setUser(
                  (
                    current
                  ) => ({
                    ...current,

                    email:
                      event.target
                        .value,
                  })
                )
              }
              style={{
                height: "52px",
                borderRadius:
                  "14px",
                border:
                  "1px solid #d1d5db",
                padding:
                  "0 16px",
                fontSize: "15px",
              }}
            />
          </label>
        </div>

        {/* ================= BUTTON ================= */}

        <div
          style={{
            marginTop: "28px",
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              height: "52px",
              padding: "0 24px",
              border: "none",
              borderRadius:
                "14px",
              background:
                "#111827",
              color: "#fff",
              fontWeight: "600",
              fontSize: "15px",
              cursor: "pointer",
              opacity: loading
                ? 0.7
                : 1,
            }}
          >
            {loading
              ? "Saving..."
              : "Save Settings"}
          </button>
        </div>
      </form>

      {/* ================= TOAST ================= */}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background:
              "#111827",
            color: "#fff",
            padding:
              "14px 18px",
            borderRadius:
              "12px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow:
              "0 10px 20px rgba(0,0,0,0.2)",
            zIndex: 999,
          }}
        >
          {toast}
        </div>
      )}
    </AdminShell>
  );
}