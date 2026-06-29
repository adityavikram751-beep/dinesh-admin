"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import AdminShell from "../components/AdminShell";
import { apiRequest } from "../lib/api";

const VIDEO_PLANS_URL = "https://api.dineshsehgal.com/api/video-plans";

// ================= TYPES =================

type PriceEntry = {
  currencyCode: string;
  price: number;
  symbol: string;
  _id?: string;
};

type GymPlan = {
  _id: string;
  name: string;
  description: string;
  allprice: PriceEntry[];
  duration: string;
  category: string;
  features: string[];
};

type VideoPlan = {
  _id: string;
  name: string;
  allprice: PriceEntry[];
  duration: string;
};

// ================= CURRENCY OPTIONS =================

const CURRENCY_OPTIONS = [
  { code: "INR", symbol: "₹", label: "INR — ₹ Indian Rupee" },
  { code: "USD", symbol: "$", label: "USD — $ US Dollar" },
  { code: "GBP", symbol: "£", label: "GBP — £ British Pound" },
  { code: "EUR", symbol: "€", label: "EUR — € Euro" },
  { code: "AED", symbol: "د.إ", label: "AED — د.إ UAE Dirham" },
  { code: "AUD", symbol: "A$", label: "AUD — A$ Australian Dollar" },
  { code: "CAD", symbol: "C$", label: "CAD — C$ Canadian Dollar" },
  { code: "SGD", symbol: "S$", label: "SGD — S$ Singapore Dollar" },
  { code: "SAR", symbol: "﷼", label: "SAR — ﷼ Saudi Riyal" },
  { code: "NZD", symbol: "NZ$", label: "NZD — NZ$ New Zealand Dollar" },
];

function getSymbol(code: string) {
  return CURRENCY_OPTIONS.find((c) => c.code === code)?.symbol || code;
}

// ================= EMPTY FORM =================

type PriceRow = { currencyCode: string; price: string };

const emptyForm = {
  name: "",
  description: "",
  duration: "",
  category: "transformation",
  featuresInput: "",
  prices: [{ currencyCode: "INR", price: "" }] as PriceRow[],
};

const emptyVideoForm = {
  name: "",
  duration: "",
  prices: [{ currencyCode: "INR", price: "" }] as PriceRow[],
};

// ================= EXTRACT =================

function extractPlans(data: unknown): GymPlan[] {
  if (Array.isArray(data)) return data as GymPlan[];
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    for (const key of ["plans", "data", "results", "items"]) {
      if (Array.isArray(d[key])) return d[key] as GymPlan[];
    }
  }
  return [];
}

function extractVideoPlans(data: unknown): VideoPlan[] {
  if (Array.isArray(data)) return data as VideoPlan[];
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    for (const key of ["videoplans", "videoPlans", "plans", "data"]) {
      if (Array.isArray(d[key])) return d[key] as VideoPlan[];
    }
  }
  return [];
}

function safeStr(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val);
}

// ================= PAGE =================

export default function GymPlanPage() {
  const [category, setCategory] = useState("transformation");
  const [plans, setPlans] = useState<GymPlan[]>([]);
  const [videoPlans, setVideoPlans] = useState<VideoPlan[]>([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");

  const [videoForm, setVideoForm] = useState(emptyVideoForm);
  const [editingVideoId, setEditingVideoId] = useState("");

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const isVideo = category === "video";

  useEffect(() => {
    loadData(category);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  // ================= LOAD =================

  async function loadData(currentCategory?: string) {
    const cat = currentCategory ?? category;
    try {
      if (cat === "video") {
        const res = await fetch(VIDEO_PLANS_URL);
        const data = await res.json();
        setVideoPlans(extractVideoPlans(data));
      } else {
        const data = await apiRequest<unknown>(`/api/plans/plans?category=${cat}`);
        setPlans(extractPlans(data));
      }
    } catch (err) {
      console.error(err);
    }
  }

  // ================= PRICE ROW HELPERS =================

  function addPriceRow() {
    setForm((prev) => ({ ...prev, prices: [...prev.prices, { currencyCode: "USD", price: "" }] }));
  }
  function removePriceRow(index: number) {
    setForm((prev) => ({ ...prev, prices: prev.prices.filter((_, i) => i !== index) }));
  }
  function updatePriceRow(index: number, field: keyof PriceRow, value: string) {
    setForm((prev) => {
      const updated = [...prev.prices];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, prices: updated };
    });
  }

  function addVideoPriceRow() {
    setVideoForm((prev) => ({ ...prev, prices: [...prev.prices, { currencyCode: "USD", price: "" }] }));
  }
  function removeVideoPriceRow(index: number) {
    setVideoForm((prev) => ({ ...prev, prices: prev.prices.filter((_, i) => i !== index) }));
  }
  function updateVideoPriceRow(index: number, field: keyof PriceRow, value: string) {
    setVideoForm((prev) => {
      const updated = [...prev.prices];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, prices: updated };
    });
  }

  // ================= SUBMIT NON-VIDEO =================

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const allprice = form.prices
        .filter((p) => p.price !== "")
        .map((p) => ({ currencyCode: p.currencyCode, price: Number(p.price), symbol: getSymbol(p.currencyCode) }));

      const featuresArray = form.featuresInput.split(/[,\n]+/).map((f) => f.trim()).filter(Boolean);

      const payload = {
        name: form.name,
        description: form.description,
        allprice,
        duration: form.duration,
        category: form.category,
        features: featuresArray,
      };

      if (editingId) {
        await apiRequest(`/api/plans/plans/${editingId}`, { method: "PUT", body: payload });
        showToast("Plan updated ✅");
      } else {
        await apiRequest("/api/plans/plans", { method: "POST", body: payload });
        showToast("Plan created ✅");
      }

      setForm({ ...emptyForm, category });
      setEditingId("");
      loadData(category);
    } catch (err) {
      showToast("Something went wrong ❌");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ================= SUBMIT VIDEO =================

  async function handleVideoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const allprice = videoForm.prices
        .filter((p) => p.price !== "")
        .map((p) => ({ currencyCode: p.currencyCode, price: Number(p.price), symbol: getSymbol(p.currencyCode) }));

      const payload = { title: videoForm.name, allprice, duration: videoForm.duration };

      if (editingVideoId) {
        await fetch(`${VIDEO_PLANS_URL}/${editingVideoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        showToast("Video plan updated ✅");
      } else {
        await fetch(VIDEO_PLANS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        showToast("Video plan created ✅");
      }

      setVideoForm(emptyVideoForm);
      setEditingVideoId("");
      loadData("video");
    } catch (err) {
      showToast("Something went wrong ❌");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ================= EDIT =================

  function handleEdit(plan: GymPlan) {
    setEditingId(plan._id);
    setForm({
      name: safeStr(plan.name),
      description: safeStr(plan.description),
      duration: safeStr(plan.duration),
      category: safeStr(plan.category) || category,
      featuresInput: Array.isArray(plan.features) ? plan.features.join("\n") : "",
      prices:
        Array.isArray(plan.allprice) && plan.allprice.length > 0
          ? plan.allprice.map((p) => ({ currencyCode: p.currencyCode, price: String(p.price) }))
          : [{ currencyCode: "INR", price: "" }],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleVideoEdit(plan: VideoPlan) {
    setEditingVideoId(plan._id);
    setVideoForm({
      name: safeStr(plan.name),
      duration: safeStr(plan.duration),
      prices:
        Array.isArray(plan.allprice) && plan.allprice.length > 0
          ? plan.allprice.map((p) => ({ currencyCode: p.currencyCode, price: String(p.price) }))
          : [{ currencyCode: "INR", price: "" }],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ================= DELETE =================

  async function handleDelete(id: string) {
    try {
      await apiRequest(`/api/plans/plans/${id}`, { method: "DELETE" });
      showToast("Plan deleted");
      loadData(category);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleVideoDelete(id: string) {
    try {
      await fetch(`${VIDEO_PLANS_URL}/${id}`, { method: "DELETE" });
      showToast("Video plan deleted");
      loadData("video");
    } catch (err) {
      console.error(err);
    }
  }

  // ================= UI =================

  return (
    <AdminShell>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: toast.includes("❌") ? "#ef4444" : "#22c55e",
            color: "#fff",
            padding: "12px 28px",
            borderRadius: 12,
            fontWeight: 700,
            zIndex: 9999,
            boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          }}
        >
          {toast}
        </div>
      )}

      <section className="banner-page">

        {/* CATEGORY TABS */}
        <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
          {["transformation", "diet", "video"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategory(cat);
                setForm({ ...emptyForm, category: cat });
                setEditingId("");
                setVideoForm(emptyVideoForm);
                setEditingVideoId("");
                loadData(cat);
              }}
              style={{
                padding: "8px 22px",
                borderRadius: 20,
                border: "2px solid",
                borderColor: category === cat ? "#111" : "#ddd",
                background: category === cat ? "#111" : "#fff",
                color: category === cat ? "#fff" : "#333",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* VIDEO FORM */}
        {isVideo && (
          <form className="banner-form" onSubmit={handleVideoSubmit}>
            <h2>{editingVideoId ? "Update Video Plan" : "Create Video Plan"}</h2>
            <div className="banner-form-grid">
              <input
                required
                placeholder="Plan Name"
                value={videoForm.name}
                onChange={(e) => setVideoForm((p) => ({ ...p, name: e.target.value }))}
              />
              <input
                required
                placeholder="Duration (e.g. 4 weeks)"
                value={videoForm.duration}
                onChange={(e) => setVideoForm((p) => ({ ...p, duration: e.target.value }))}
              />
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <strong>Prices</strong>
                <button
                  type="button"
                  onClick={addVideoPriceRow}
                  style={{ padding: "4px 14px", borderRadius: 8, background: "#111", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
                >
                  + Add Currency
                </button>
              </div>

              {videoForm.prices.map((row, index) => (
                <div key={index} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <select
                    value={row.currencyCode}
                    onChange={(e) => updateVideoPriceRow(index, "currencyCode", e.target.value)}
                    style={{ flex: 1, minWidth: 160, padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }}
                  >
                    {CURRENCY_OPTIONS.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <input
                    required
                    type="number"
                    placeholder="Price"
                    value={row.price}
                    onChange={(e) => updateVideoPriceRow(index, "price", e.target.value)}
                    style={{ flex: 1, minWidth: 120, padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }}
                  />
                  {videoForm.prices.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVideoPriceRow(index)}
                      style={{ padding: "8px 14px", borderRadius: 8, background: "#ef4444", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button className="submit-btn" disabled={loading} type="submit">
              {loading ? "Please wait..." : editingVideoId ? "Update Plan" : "Create Plan"}
            </button>
          </form>
        )}

        {/* NON-VIDEO FORM */}
        {!isVideo && (
          <form className="banner-form" onSubmit={handleSubmit}>
            <h2>{editingId ? "Update Plan" : "Create Plan"}</h2>
            <div className="banner-form-grid">
              <input
                required
                placeholder="Plan Name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
              <input
                required
                placeholder="Duration (e.g. 3 months)"
                value={form.duration}
                onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
              />
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              >
                <option value="transformation">Transformation</option>
                <option value="diet">Diet</option>
              </select>

              <textarea
                rows={5}
                placeholder="Features (comma separated or one per line)&#10;e.g. Customized Workout Plan, Basic Diet Plan, WhatsApp Support"
                value={form.featuresInput}
                onChange={(e) => setForm((p) => ({ ...p, featuresInput: e.target.value }))}
                style={{ gridColumn: "1 / -1", padding: "12px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit", resize: "vertical", minHeight: "100px", backgroundColor: "#fafafa" }}
              />

              <textarea
                rows={3}
                required
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                style={{ gridColumn: "1 / -1", padding: "12px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit", resize: "vertical", minHeight: "80px", backgroundColor: "#fafafa" }}
              />
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <strong>Prices</strong>
                <button
                  type="button"
                  onClick={addPriceRow}
                  style={{ padding: "4px 14px", borderRadius: 8, background: "#111", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
                >
                  + Add Currency
                </button>
              </div>

              {form.prices.map((row, index) => (
                <div key={index} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <select
                    value={row.currencyCode}
                    onChange={(e) => updatePriceRow(index, "currencyCode", e.target.value)}
                    style={{ flex: 1, minWidth: 160, padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }}
                  >
                    {CURRENCY_OPTIONS.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <input
                    required
                    type="number"
                    placeholder="Price"
                    value={row.price}
                    onChange={(e) => updatePriceRow(index, "price", e.target.value)}
                    style={{ flex: 1, minWidth: 120, padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }}
                  />
                  {form.prices.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePriceRow(index)}
                      style={{ padding: "8px 14px", borderRadius: 8, background: "#ef4444", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button className="submit-btn" disabled={loading} type="submit">
              {loading ? "Please wait..." : editingId ? "Update Plan" : "Create Plan"}
            </button>
          </form>
        )}

        {/* LIST */}
        <div className="banner-section">
          <div className="section-header">
            <h2 style={{ textTransform: "capitalize" }}>{category} Plans</h2>
            <span className="count-badge">{isVideo ? videoPlans.length : plans.length}</span>
          </div>

          {isVideo ? (
            videoPlans.length === 0 ? (
              <div className="empty-state">No video plans found</div>
            ) : (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:20,alignItems:"stretch"}}>
                {videoPlans.map((plan) => (
                  <VideoPlanCard key={plan._id} plan={plan} onEdit={handleVideoEdit} onDelete={handleVideoDelete} />
                ))}
              </div>
            )
          ) : (
            plans.length === 0 ? (
              <div className="empty-state">No plans found</div>
            ) : (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:20,alignItems:"stretch"}}>
                {plans.map((plan) => (
                  <PlanCard key={plan._id} plan={plan} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>
            )
          )}
        </div>

      </section>
    </AdminShell>
  );
}

// ================= PLAN CARD (non-video) =================

function PlanCard({
  plan,
  onEdit,
  onDelete,
}: {
  plan: GymPlan;
  onEdit: (plan: GymPlan) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8edf5",
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Card Body */}
      <div style={{ padding: "20px 20px 16px", flex: 1 }}>
        {/* Category badge */}
        <span
          style={{
            display: "inline-block",
            background: "#eef2ff",
            color: "#3730a3",
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 20,
            padding: "3px 10px",
            textTransform: "capitalize",
            letterSpacing: "0.05em",
            marginBottom: 10,
          }}
        >
          {plan.category}
        </span>

        <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
          {plan.name}
        </h3>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
          ⏱ {plan.duration}
        </p>

        {/* Prices */}
        {Array.isArray(plan.allprice) && plan.allprice.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {plan.allprice.map((p, i) => (
              <span
                key={i}
                style={{
                  background: "#f4f4f4",
                  border: "1px solid #e0e0e0",
                  borderRadius: 10,
                  padding: "4px 12px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#312e81",
                }}
              >
                {p.symbol || p.currencyCode} {p.price}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {plan.description && (
          <p style={{ margin: "0 0 12px", lineHeight: 1.6, color: "#555", fontSize: 13 }}>
            {plan.description}
          </p>
        )}

        {/* Features */}
        {Array.isArray(plan.features) && plan.features.length > 0 && (
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {plan.features.map((f, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6, fontSize: 13, color: "#444", lineHeight: 1.5 }}>
                <span style={{ color: "#22c55e", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ✅ Action buttons — card ke BOTTOM mein, border se alag */}
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "14px 20px",
          borderTop: "1px solid #f1f5f9",
          background: "#fafbfd",
        }}
      >
        <button
          type="button"
          onClick={() => onEdit(plan)}
          style={{
            flex: 1,
            padding: "10px 0",
            borderRadius: 10,
            border: "1.5px solid #3b82f6",
            background: "#eff6ff",
            color: "#1d4ed8",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#dbeafe")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#eff6ff")}
        >
          ✏️ Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(plan._id)}
          style={{
            flex: 1,
            padding: "10px 0",
            borderRadius: 10,
            border: "1.5px solid #ef4444",
            background: "#fef2f2",
            color: "#dc2626",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fef2f2")}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

// ================= VIDEO PLAN CARD =================

function VideoPlanCard({
  plan,
  onEdit,
  onDelete,
}: {
  plan: VideoPlan;
  onEdit: (plan: VideoPlan) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8edf5",
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Card Body */}
      <div style={{ padding: "20px 20px 16px", flex: 1 }}>
        {/* Video badge */}
        <span
          style={{
            display: "inline-block",
            background: "#fdf4ff",
            color: "#7e22ce",
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 20,
            padding: "3px 10px",
            letterSpacing: "0.05em",
            marginBottom: 10,
          }}
        >
          🎬 Video
        </span>

        <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
          {plan.name}
        </h3>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
          ⏱ {plan.duration}
        </p>

        {/* Prices */}
        {Array.isArray(plan.allprice) && plan.allprice.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {plan.allprice.map((p, i) => (
              <span
                key={i}
                style={{
                  background: "#f4f4f4",
                  border: "1px solid #e0e0e0",
                  borderRadius: 10,
                  padding: "4px 12px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#312e81",
                }}
              >
                {p.symbol || p.currencyCode} {p.price}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Action buttons — card ke BOTTOM mein */}
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "14px 20px",
          borderTop: "1px solid #f1f5f9",
          background: "#fafbfd",
        }}
      >
        <button
          type="button"
          onClick={() => onEdit(plan)}
          style={{
            flex: 1,
            padding: "10px 0",
            borderRadius: 10,
            border: "1.5px solid #3b82f6",
            background: "#eff6ff",
            color: "#1d4ed8",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#dbeafe")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#eff6ff")}
        >
          ✏️ Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(plan._id)}
          style={{
            flex: 1,
            padding: "10px 0",
            borderRadius: 10,
            border: "1.5px solid #ef4444",
            background: "#fef2f2",
            color: "#dc2626",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fef2f2")}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}