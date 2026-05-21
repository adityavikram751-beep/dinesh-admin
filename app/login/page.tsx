"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { apiRequest } from "../lib/api";

const storageKey = "fitadmin_logged_in";
const tokenKey = "fitadmin_token";
const authCookieKey = "fitadmin_auth";

function setAuthCookie() {
  document.cookie = `${authCookieKey}=true; path=/; max-age=604800; SameSite=Lax`;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [otpSent, setOtpSent] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ================= SEND OTP =================

  async function handleSendOtp(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);

    setError("");

    setMessage("");

    try {
      await apiRequest(
        "/api/admin/auth/send-otp",
        {
          method: "POST",

          body: {
            email,
          },
        }
      );

      setOtpSent(true);

      setMessage(
        "OTP sent successfully. Check your email."
      );
    } catch (err) {
      console.log(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to send OTP"
      );
    } finally {
      setLoading(false);
    }
  }

  // ================= VERIFY OTP =================

  async function handleVerifyOtp(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const formData = new FormData(
      event.currentTarget
    );

    const otp = String(
      formData.get("otp") || ""
    );

    setLoading(true);

    setError("");

    setMessage("");

    try {
      // ================= VERIFY API =================

      const data =
        await apiRequest<any>(
          "/api/admin/auth/verify-otp",
          {
            method: "POST",

            body: {
              email,
              otp,
            },
          }
        );

      console.log(
        "LOGIN DATA",
        data
      );

      // ================= TOKEN =================

      const token =
        data?.token ||
        data?.data?.token ||
        "";

      console.log(
        "TOKEN",
        token
      );

      // ================= SAVE LOGIN =================

      localStorage.setItem(
        storageKey,
        "true"
      );

      setAuthCookie();

      localStorage.setItem(
        "fitadmin_email",
        email
      );

      // ================= SAVE TOKEN =================

      localStorage.setItem(
        tokenKey,
        token
      );

      // ================= OPTIONAL =================

      localStorage.setItem(
        "fitadmin_name",
        data?.user?.name ||
          "Admin"
      );

      localStorage.setItem(
        "fitadmin_gym",
        data?.user?.gym ||
          "Fitness Admin"
      );

      console.log(
        "TOKEN SAVED",
        localStorage.getItem(
          tokenKey
        )
      );

      // ================= SUCCESS =================

      setMessage(
        "Login successful"
      );

      // ================= REDIRECT =================

      setTimeout(() => {
        const nextPath =
          new URLSearchParams(window.location.search).get("next") ||
          "/enquiry";

        router.push(
          nextPath
        );
      }, 500);
    } catch (err) {
      console.log(err);

      setError(
        err instanceof Error
          ? err.message
          : "Invalid OTP"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      {/* ================= LEFT ================= */}

      <section className="login-art">
        <div className="brand">
          <span>
            Dinesh sehgal
          </span>
        </div>

        <div>
          <h1>
            Manage your fitness
            business with
            confidence.
          </h1>

          <p>
            Track dashboard
            metrics, enquiries,
            contact messages,
            blogs, settings,
            and notifications
            from one clean admin
            panel.
          </p>
        </div>
      </section>

      {/* ================= RIGHT ================= */}

      <section className="login-panel">
        <form
          className="auth-card"
          onSubmit={
            otpSent
              ? handleVerifyOtp
              : handleSendOtp
          }
        >
          <h2>Login</h2>

          <p>
            Enter admin email,
            receive OTP, and
            verify to access
            dashboard.
          </p>

          {/* EMAIL */}

          <label className="field">
            <span>Email</span>

            <input
              required
              type="email"
              name="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target
                    .value
                )
              }
              disabled={
                otpSent ||
                loading
              }
            />
          </label>

          {/* OTP */}

          {otpSent && (
            <label className="field">
              <span>OTP</span>

              <input
                required
                inputMode="numeric"
                name="otp"
                placeholder="Enter OTP"
              />
            </label>
          )}

          {/* BUTTON */}

          <button
            className="primary-btn"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : otpSent
              ? "Verify OTP"
              : "Send OTP"}
          </button>

          {/* CHANGE EMAIL */}

          {otpSent && (
            <button
              className="secondary-btn auth-wide-btn"
              type="button"
              onClick={() =>
                setOtpSent(false)
              }
              disabled={loading}
            >
              Change Email
            </button>
          )}

          {/* SUCCESS */}

          {message && (
            <div className="success-note">
              {message}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="error-note">
              {error}
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
