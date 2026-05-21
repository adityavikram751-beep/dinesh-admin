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
        className="settings-card"
        onSubmit={handleSubmit}
      >
        <h2>
          Admin Settings
        </h2>

        <div className="settings-grid">
          <aside className="settings-profile-panel">
            <img
              className="settings-avatar"
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
            />

            <div className="settings-profile-copy">
              <strong>
                {user.username || "Admin"}
              </strong>
              <span>
                {user.email || "admin account"}
              </span>
            </div>

            <label className="settings-upload-btn">
              <span>
                Change Photo
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={
                  handleImageUpload
                }
              />
            </label>
          </aside>

          <div className="settings-fields">
            <label className="field">
              <span>
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
            />
          </label>

            <label className="field">
              <span>
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
            />
          </label>

            <div className="actions settings-actions">
              <button
                className="primary-btn"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {toast && (
        <div className="toast show">
          {toast}
        </div>
      )}
    </AdminShell>
  );
}
