"use client";

import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";

type Enquiry = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  isRead?: boolean;
  createdAt?: string;
};

const baseUrl =
  "https://dinesh-sagel-backend.onrender.com";

const tokenKey =
  "fitadmin_token";

export default function EnquiryPage() {
  const [enquiries, setEnquiries] =
    useState<Enquiry[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState("");

  // ================= LOAD =================

  useEffect(() => {
    loadEnquiries();
  }, []);

  // ================= GET API =================

  async function loadEnquiries() {
    try {
      setLoading(true);

      const token =
        localStorage.getItem(
          tokenKey
        );

      const response =
        await fetch(
          `${baseUrl}/api/enquiries`,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
            },

            cache: "no-store",
          }
        );

      // ✅ DIRECT JSON

      const data =
        await response.json();

      console.log(
        "GET ENQUIRIES =>",
        data
      );

      // ✅ ARRAY RESPONSE

      if (Array.isArray(data)) {
        setEnquiries(data);
      }

      // ✅ OBJECT RESPONSE

      else if (
        data.success &&
        Array.isArray(
          data.enquiries
        )
      ) {
        setEnquiries(
          data.enquiries
        );
      }

      // ✅ EMPTY

      else {
        setEnquiries([]);
      }
    } catch (error) {
      console.log(
        "GET ERROR =>",
        error
      );

      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  }

  // ================= PATCH API =================

  async function markAsRead(
    id: string
  ) {
    try {
      setUpdatingId(id);

      const token =
        localStorage.getItem(
          tokenKey
        );

      const response =
        await fetch(
          `${baseUrl}/api/enquiries/${id}/read`,
          {
            method: "PATCH",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      console.log(
        "PATCH RESPONSE =>",
        data
      );

      // ✅ UPDATE UI

      setEnquiries(
        (items) =>
          items.map(
            (item) =>
              item._id ===
              id
                ? {
                    ...item,
                    isRead: true,
                  }
                : item
          )
      );
    } catch (error) {
      console.log(
        "PATCH ERROR =>",
        error
      );
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <AdminShell>
      <section
        style={{
          display: "flex",
          flexDirection:
            "column",
          gap: "24px",
          paddingBottom:
            "30px",
        }}
      >
        {/* ================= HEADER ================= */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
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
              Manage all customer
              enquiries here.
            </p>
          </div>

          <div
            style={{
              background: "#111827",
              color: "#fff",
              padding:
                "14px 22px",
              borderRadius:
                "16px",
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            Total:{" "}
            {
              enquiries.length
            }
          </div>
        </div>

        {/* ================= LOADING ================= */}

        {loading && (
          <div
            style={{
              background:
                "#fff",
              padding: "30px",
              borderRadius:
                "24px",
              textAlign:
                "center",
              fontWeight:
                "600",
            }}
          >
            Loading enquiries...
          </div>
        )}

        {/* ================= EMPTY ================= */}

        {!loading &&
          enquiries.length ===
            0 && (
            <div
              style={{
                background:
                  "#fff",
                padding: "40px",
                borderRadius:
                  "24px",
                textAlign:
                  "center",
                color:
                  "#6b7280",
                fontWeight:
                  "600",
              }}
            >
              No enquiries found
            </div>
          )}

        {/* ================= LIST ================= */}

        {!loading &&
          enquiries.map(
            (item) => (
              <div
                key={item._id}
                style={{
                  background:
                    "#fff",
                  borderRadius:
                    "24px",
                  padding:
                    "24px",
                  boxShadow:
                    "0 10px 25px rgba(0,0,0,0.05)",
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  gap: "20px",
                  flexWrap:
                    "wrap",
                  alignItems:
                    "center",
                }}
              >
                {/* LEFT */}

                <div
                  style={{
                    flex: 1,
                    minWidth:
                      "240px",
                  }}
                >
                  <h2
                    style={{
                      fontSize:
                        "24px",
                      fontWeight:
                        "700",
                      color:
                        "#111827",
                      marginBottom:
                        "10px",
                    }}
                  >
                    {item.name ||
                      "No Name"}
                  </h2>

                  {item.email && (
                    <p
                      style={{
                        marginBottom:
                          "8px",
                        color:
                          "#374151",
                      }}
                    >
                      📧{" "}
                      {
                        item.email
                      }
                    </p>
                  )}

                  {item.phone && (
                    <p
                      style={{
                        marginBottom:
                          "8px",
                        color:
                          "#374151",
                      }}
                    >
                      📞{" "}
                      {
                        item.phone
                      }
                    </p>
                  )}

                  {item.message && (
                    <p
                      style={{
                        marginTop:
                          "12px",
                        color:
                          "#4b5563",
                        lineHeight:
                          "1.7",
                      }}
                    >
                      {
                        item.message
                      }
                    </p>
                  )}

                  {item.createdAt && (
                    <p
                      style={{
                        marginTop:
                          "14px",
                        color:
                          "#9ca3af",
                        fontSize:
                          "13px",
                      }}
                    >
                      {new Date(
                        item.createdAt
                      ).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* RIGHT */}

                <div
                  style={{
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    gap: "14px",
                    alignItems:
                      "flex-end",
                  }}
                >
                  <span
                    style={{
                      padding:
                        "10px 16px",
                      borderRadius:
                        "999px",
                      fontSize:
                        "14px",
                      fontWeight:
                        "700",
                      background:
                        item.isRead
                          ? "#dcfce7"
                          : "#fee2e2",
                      color:
                        item.isRead
                          ? "#166534"
                          : "#b91c1c",
                    }}
                  >
                    {item.isRead
                      ? "Read"
                      : "Unread"}
                  </span>

                  {!item.isRead && (
                    <button
                      onClick={() =>
                        markAsRead(
                          item._id
                        )
                      }
                      disabled={
                        updatingId ===
                        item._id
                      }
                      style={{
                        height:
                          "48px",
                        padding:
                          "0 20px",
                        border:
                          "none",
                        borderRadius:
                          "14px",
                        background:
                          "#111827",
                        color:
                          "#fff",
                        fontWeight:
                          "600",
                        cursor:
                          "pointer",
                        minWidth:
                          "150px",
                      }}
                    >
                      {updatingId ===
                      item._id
                        ? "Updating..."
                        : "Mark as Read"}
                    </button>
                  )}
                </div>
              </div>
            )
          )}
      </section>
    </AdminShell>
  );
}