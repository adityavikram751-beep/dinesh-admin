"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "../components/AdminShell";

type Enquiry = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;          // purana field (compatibility)
  mobileNumber?: string;   // naya field
  message?: string;
  isRead?: boolean;
  createdAt?: string;
};

const baseUrl =
  "https://api.dineshsehgal.com";

const tokenKey =
  "fitadmin_token";

function normalizeToken(
  token: string | null
) {
  if (
    !token ||
    token === "null" ||
    token === "undefined"
  ) {
    return null;
  }

  const trimmed = token.trim();
  return trimmed ? trimmed : null;
}

export default function EnquiryPage() {
  const [enquiries, setEnquiries] =
    useState<Enquiry[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState("");

  const [error, setError] =
    useState("");

  const router = useRouter();

  useEffect(() => {
    const token = normalizeToken(
      localStorage.getItem(tokenKey)
    );

    if (!token) {
      router.replace("/login");
      return;
    }

    loadEnquiries();
  }, [router]);

  async function loadEnquiries() {
    try {
      setLoading(true);
      setError("");

      const token = normalizeToken(
        localStorage.getItem(tokenKey)
      );

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(
        `${baseUrl}/api/enquiries`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          errorData ||
            `Enquiries request failed (${response.status})`
        );
      }

      const data = await response.json();
      console.log("GET ENQUIRIES =>", data);

      if (Array.isArray(data)) {
        setEnquiries(data);
      } else if (
        data?.success &&
        Array.isArray(data.enquiries)
      ) {
        setEnquiries(data.enquiries);
      } else {
        setEnquiries([]);
      }
    } catch (error) {
      console.log("GET ERROR =>", error);
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load enquiries"
      );
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      setUpdatingId(id);

      const token = normalizeToken(
        localStorage.getItem(tokenKey)
      );

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(
        `${baseUrl}/api/enquiries/${id}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("PATCH RESPONSE =>", data);

      setEnquiries((items) =>
        items.map((item) =>
          item._id === id
            ? { ...item, isRead: true }
            : item
        )
      );
    } catch (error) {
      console.log("PATCH ERROR =>", error);
    } finally {
      setUpdatingId("");
    }
  }

  // Helper to get the best available phone number
  function getPhoneNumber(item: Enquiry): string | undefined {
    return item.mobileNumber || item.phone || undefined;
  }

  return (
    <AdminShell>
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          paddingBottom: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "34px",
                fontWeight: "700",
                color: "#111827",
                marginBottom: "6px",
              }}
            >
              Enquiries
            </h1>
            <p
              style={{
                color: "#6b7280",
                fontSize: "15px",
              }}
            >
              Manage all customer enquiries here.
            </p>
          </div>
          <div
            style={{
              background: "#111827",
              color: "#fff",
              padding: "14px 22px",
              borderRadius: "16px",
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            Total: {enquiries.length}
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "22px",
              borderRadius: "20px",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        {loading && (
          <div
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "24px",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            Loading enquiries...
          </div>
        )}

        {!loading && !error && enquiries.length === 0 && (
          <div
            style={{
              background: "#fff",
              padding: "40px",
              borderRadius: "24px",
              textAlign: "center",
              color: "#6b7280",
              fontWeight: "600",
            }}
          >
            No enquiries found
          </div>
        )}

        {!loading && !error &&
          enquiries.map((item) => (
            <div
              key={item._id}
              style={{
                background: "#fff",
                borderRadius: "24px",
                padding: "24px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: "240px",
                }}
              >
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#111827",
                    marginBottom: "10px",
                  }}
                >
                  {item.name || "No Name"}
                </h2>

                {item.email && (
                  <p
                    style={{
                      marginBottom: "8px",
                      color: "#374151",
                    }}
                  >
                    📧 {item.email}
                  </p>
                )}

                {/* ✅ Mobile Number - priority to mobileNumber, fallback to phone */}
                {getPhoneNumber(item) && (
                  <p
                    style={{
                      marginBottom: "8px",
                      color: "#374151",
                    }}
                  >
                    📞 {getPhoneNumber(item)}
                  </p>
                )}

                {item.message && (
                  <p
                    style={{
                      marginTop: "12px",
                      color: "#4b5563",
                      lineHeight: "1.7",
                    }}
                  >
                    {item.message}
                  </p>
                )}

                {item.createdAt && (
                  <p
                    style={{
                      marginTop: "14px",
                      color: "#9ca3af",
                      fontSize: "13px",
                    }}
                  >
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  alignItems: "flex-end",
                }}
              >
                <span
                  style={{
                    padding: "10px 16px",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: "700",
                    background: item.isRead
                      ? "#dcfce7"
                      : "#fee2e2",
                    color: item.isRead
                      ? "#166534"
                      : "#b91c1c",
                  }}
                >
                  {item.isRead ? "Read" : "Unread"}
                </span>

                {!item.isRead && (
                  <button
                    onClick={() => markAsRead(item._id)}
                    disabled={updatingId === item._id}
                    style={{
                      height: "48px",
                      padding: "0 20px",
                      border: "none",
                      borderRadius: "14px",
                      background: "#111827",
                      color: "#fff",
                      fontWeight: "600",
                      cursor: "pointer",
                      minWidth: "150px",
                    }}
                  >
                    {updatingId === item._id
                      ? "Updating..."
                      : "Mark as Read"}
                  </button>
                )}
              </div>
            </div>
          ))}
      </section>
    </AdminShell>
  );
}