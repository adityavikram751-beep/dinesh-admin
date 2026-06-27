"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "../components/AdminShell";

type Payment = {
  payment_id: string;
  full_name: string;
  course_name: string;
  gender?: string;
  payment_status: "success" | "pending" | "failed" | string;
  amount: number;
  currency: string;
  payment_method?: string;
  payment_date: string;
  [key: string]: any;
};

type ApiResponse = {
  success: boolean;
  totalPayments: number;
  payments: Payment[];
};

const baseUrl = "https://dinesh-sagel-backend.onrender.com";
const tokenKey = "fitadmin_token";

function normalizeToken(token: string | null) {
  if (!token || token === "null" || token === "undefined") return null;
  return token.trim() || null;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({ total: 0, success: 0, pending: 0, failed: 0 });
  const router = useRouter();

  useEffect(() => {
    const token = normalizeToken(localStorage.getItem(tokenKey));
    if (!token) { router.replace("/login"); return; }
    loadPayments();
  }, [router]);

  async function loadPayments() {
    try {
      setLoading(true);
      setError("");
      const token = normalizeToken(localStorage.getItem(tokenKey));
      if (!token) { router.replace("/login"); return; }

      const res = await fetch(`${baseUrl}/api/all-payments`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (!res.ok) throw new Error((await res.text()) || `Error ${res.status}`);
      const data: ApiResponse = await res.json();

      if (data.success && Array.isArray(data.payments)) {
        setPayments(data.payments);
        calcSummary(data.payments);
      } else {
        setPayments([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load payments");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }

  function calcSummary(list: Payment[]) {
    let success = 0, pending = 0, failed = 0;
    list.forEach((p) => {
      const s = p.payment_status?.toLowerCase() || "";
      if (s === "success" || s === "completed" || s === "paid") success++;
      else if (s === "failed" || s === "error") failed++;
      else pending++;
    });
    setSummary({ total: list.length, success, pending, failed });
  }

  function getChip(status?: string) {
    const s = status?.toLowerCase() || "";

    if (s === "success" || s === "completed" || s === "paid")
      return (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "5px 11px", borderRadius: 999,
          background: "#dcfce7", color: "#166534",
          fontSize: 11, fontWeight: 700, whiteSpace: "nowrap"
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
          Success
        </span>
      );

    if (s === "pending")
      return (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "5px 11px", borderRadius: 999,
          background: "#fff7ed", color: "#9a3412",
          fontSize: 11, fontWeight: 700, whiteSpace: "nowrap"
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316", flexShrink: 0 }} />
          Pending
        </span>
      );

    if (s === "failed" || s === "error")
      return (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "5px 11px", borderRadius: 999,
          background: "#fef2f2", color: "#991b1b",
          fontSize: 11, fontWeight: 700, whiteSpace: "nowrap"
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
          Failed
        </span>
      );

    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "5px 11px", borderRadius: 999,
        background: "#f1f5f9", color: "#475569",
        fontSize: 11, fontWeight: 700, whiteSpace: "nowrap"
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#94a3b8", flexShrink: 0 }} />
        {status || "Unknown"}
      </span>
    );
  }

  function sym(c: string) {
    return ({ INR: "₹", USD: "$", GBP: "£", EUR: "€", AED: "د.إ" } as Record<string, string>)[c] || c;
  }
  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }
  function fmtTime(d: string) {
    return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <AdminShell>
      <div className="page">

        {/* HEADER */}
        <div className="hdr">
          <div className="hdr-text">
            <h1 className="title">Payments</h1>
            <p className="sub">Track every transaction in one place</p>
          </div>
          <button onClick={loadPayments} disabled={loading} className="rbtn">
            ↻ {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        {/* STATS */}
        <div className="stats">
          <div className="stat s-all">
            <span className="stat-n">{summary.total}</span>
            <span className="stat-l">Total</span>
          </div>
          <div className="stat s-ok">
            <span className="stat-n">{summary.success}</span>
            <span className="stat-l">Success</span>
          </div>
          <div className="stat s-pend">
            <span className="stat-n">{summary.pending}</span>
            <span className="stat-l">Pending</span>
          </div>
          <div className="stat s-fail">
            <span className="stat-n">{summary.failed}</span>
            <span className="stat-l">Failed</span>
          </div>
        </div>

        {/* STATES */}
        {error && <div className="state-box state-err">{error}</div>}
        {loading && <div className="state-box">Loading payments…</div>}
        {!loading && !error && payments.length === 0 && (
          <div className="state-box">No payments yet.</div>
        )}

        {/* DESKTOP TABLE */}
        {!loading && !error && payments.length > 0 && (
          <>
            <div className="table-card desktop-only">
              <div className="t-head">
                <span>Customer</span>
                <span>Plan</span>
                <span>Method</span>
                <span>Date</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              {payments.map((p, i) => (
                <div key={p.payment_id} className={`t-row${i % 2 !== 0 ? " alt" : ""}`}>
                  <div>
                    <div className="cm">{p.full_name || "—"}</div>
                    <div className="cs">{p.payment_id}</div>
                  </div>
                  <div>
                    <div className="cm">{p.course_name || "—"}</div>
                    {p.gender && <div className="cs">{p.gender}</div>}
                  </div>
                  <div><div className="cm">{p.payment_method || "—"}</div></div>
                  <div>
                    <div className="cm">{fmtDate(p.payment_date)}</div>
                    <div className="cs">{fmtTime(p.payment_date)}</div>
                  </div>
                  <div><span className="amt">{sym(p.currency)}{p.amount?.toLocaleString()}</span></div>
                  <div>{getChip(p.payment_status)}</div>
                </div>
              ))}
            </div>

            {/* MOBILE CARDS */}
            <div className="m-cards mobile-only">
              {payments.map((p) => (
                <div key={p.payment_id} className="mc">
                  <div className="mc-top">
                    <div>
                      <div className="mc-name">{p.full_name || "—"}</div>
                      <div className="mc-id">{p.payment_id}</div>
                    </div>
                    {getChip(p.payment_status)}
                  </div>
                  <div className="mc-body">
                    <div className="mc-cell">
                      <span className="mc-lbl">Plan</span>
                      <span className="mc-val">{p.course_name || "—"}</span>
                    </div>
                    <div className="mc-cell">
                      <span className="mc-lbl">Amount</span>
                      <span className="mc-val mc-amt">{sym(p.currency)}{p.amount?.toLocaleString()}</span>
                    </div>
                    <div className="mc-cell">
                      <span className="mc-lbl">Method</span>
                      <span className="mc-val">{p.payment_method || "—"}</span>
                    </div>
                    <div className="mc-cell">
                      <span className="mc-lbl">Date</span>
                      <span className="mc-val">{fmtDate(p.payment_date)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .page {
          display: flex;
          flex-direction: column;
          gap: 18px;
          padding-bottom: 48px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        /* Header */
        .hdr {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .title {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.3px;
          margin: 0 0 2px;
        }
        .sub { font-size: 12px; color: #94a3b8; margin: 0; }
        .rbtn {
          background: #312e81;
          color: #fff;
          border: none;
          padding: 9px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity .15s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .rbtn:hover { opacity: .85; }
        .rbtn:disabled { opacity: .5; cursor: not-allowed; }

        /* Stats */
        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .stat {
          border-radius: 14px;
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          position: relative;
          overflow: hidden;
        }
        .stat::after {
          content: '';
          position: absolute;
          bottom: -10px;
          right: -10px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          opacity: .12;
        }
        .s-all  { background: #eef2ff; color: #3730a3; }
        .s-all::after  { background: #3730a3; }
        .s-ok   { background: #dcfce7; color: #166534; }
        .s-ok::after   { background: #16a34a; }
        .s-pend { background: #fff7ed; color: #9a3412; }
        .s-pend::after { background: #ea580c; }
        .s-fail { background: #fef2f2; color: #991b1b; }
        .s-fail::after { background: #dc2626; }
        .stat-n {
          font-size: 26px;
          font-weight: 700;
          line-height: 1;
        }
        .stat-l {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .07em;
          margin-top: 4px;
          opacity: .7;
        }

        /* State boxes */
        .state-box {
          background: #fff;
          border: 1px solid #e8edf5;
          border-radius: 14px;
          padding: 40px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }
        .state-err { background: #fef2f2; border-color: #fecaca; color: #b91c1c; }

        /* Desktop table */
        .table-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e8edf5;
          overflow: hidden;
        }
        .t-head {
          display: grid;
          grid-template-columns: 2fr 1.8fr 1fr 1.4fr 1fr 100px;
          padding: 11px 20px;
          background: #f8fafc;
          border-bottom: 1px solid #e8edf5;
          gap: 12px;
        }
        .t-head span {
          font-size: 10px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: .07em;
        }
        .t-row {
          display: grid;
          grid-template-columns: 2fr 1.8fr 1fr 1.4fr 1fr 100px;
          padding: 13px 20px;
          gap: 12px;
          align-items: center;
          border-bottom: 1px solid #f1f5f9;
          transition: background .12s;
        }
        .t-row:last-child { border-bottom: none; }
        .t-row.alt { background: #fafbfd; }
        .t-row:hover { background: #f0f4ff; }
        .cm { font-size: 13px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cs { font-size: 11px; color: #94a3b8; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .amt { font-size: 14px; font-weight: 700; color: #312e81; }

        /* Mobile cards */
        .m-cards { display: none; flex-direction: column; gap: 10px; }
        .mc {
          background: #fff;
          border: 1px solid #e8edf5;
          border-radius: 14px;
          overflow: hidden;
        }
        .mc-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 14px 14px 0;
        }
        .mc-name { font-size: 14px; font-weight: 700; color: #0f172a; }
        .mc-id   { font-size: 11px; color: #94a3b8; margin-top: 2px; }
        .mc-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          margin-top: 12px;
          border-top: 1px solid #f1f5f9;
        }
        .mc-cell { padding: 10px 14px; display: flex; flex-direction: column; gap: 3px; }
        .mc-cell:nth-child(odd)  { border-right: 1px solid #f1f5f9; }
        .mc-cell:nth-child(3),
        .mc-cell:nth-child(4)   { border-top: 1px solid #f1f5f9; }
        .mc-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #94a3b8; }
        .mc-val { font-size: 13px; font-weight: 600; color: #0f172a; }
        .mc-amt { color: #312e81; font-size: 15px; font-weight: 700; }

        /* Responsive */
        .desktop-only { display: block; }
        .mobile-only  { display: none; }

        @media (max-width: 900px) {
          .t-head, .t-row {
            grid-template-columns: 2fr 1.6fr 1fr 1.2fr 1fr 90px;
            padding: 11px 14px;
          }
        }

        @media (max-width: 640px) {
          .stats { grid-template-columns: 1fr 1fr; }
          .desktop-only { display: none !important; }
          .mobile-only  { display: flex !important; }
        }
      `}</style>
    </AdminShell>
  );
}