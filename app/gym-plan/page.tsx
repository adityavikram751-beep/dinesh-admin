"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import AdminShell from "../components/AdminShell";
import { apiRequest } from "../lib/api";

const VIDEO_PLANS_URL = "https://dinesh-sagel-backend.onrender.com/api/video-plans";

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

// ✅ VideoPlan type mein 'name' rakho
type VideoPlan = {
  _id: string;
  name: string;           // GET se 'name' aata hai
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

// ✅ Video form – 'name' use karo
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

  // Non-video form
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");

  // Video form – 'name'
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

  // ================= PRICE ROW HELPERS (non-video) =================

  function addPriceRow() {
    setForm((prev) => ({
      ...prev,
      prices: [...prev.prices, { currencyCode: "USD", price: "" }],
    }));
  }

  function removePriceRow(index: number) {
    setForm((prev) => ({
      ...prev,
      prices: prev.prices.filter((_, i) => i !== index),
    }));
  }

  function updatePriceRow(index: number, field: keyof PriceRow, value: string) {
    setForm((prev) => {
      const updated = [...prev.prices];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, prices: updated };
    });
  }

  // ================= VIDEO PRICE ROW HELPERS =================

  function addVideoPriceRow() {
    setVideoForm((prev) => ({
      ...prev,
      prices: [...prev.prices, { currencyCode: "USD", price: "" }],
    }));
  }

  function removeVideoPriceRow(index: number) {
    setVideoForm((prev) => ({
      ...prev,
      prices: prev.prices.filter((_, i) => i !== index),
    }));
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
        .map((p) => ({
          currencyCode: p.currencyCode,
          price: Number(p.price),
          symbol: getSymbol(p.currencyCode),
        }));

      const featuresArray = form.featuresInput
        .split(/[,\n]+/)
        .map((f) => f.trim())
        .filter(Boolean);

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

  // ================= SUBMIT VIDEO – payload mein 'title' bhejo =================

  async function handleVideoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const allprice = videoForm.prices
        .filter((p) => p.price !== "")
        .map((p) => ({
          currencyCode: p.currencyCode,
          price: Number(p.price),
          symbol: getSymbol(p.currencyCode),
        }));

      // ✅ Payload mein 'title' – backend ye expect karta hai
      const payload = {
        title: videoForm.name,        // form mein 'name' hai, backend 'title' maangta hai
        allprice,
        duration: videoForm.duration,
      };

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

  // ================= EDIT NON-VIDEO =================

  function handleEdit(plan: GymPlan) {
    setEditingId(plan._id);
    setForm({
      name: safeStr(plan.name),
      description: safeStr(plan.description),
      duration: safeStr(plan.duration),
      category: safeStr(plan.category) || category,
      featuresInput: Array.isArray(plan.features) ? plan.features.join("\n") : "",
      prices: Array.isArray(plan.allprice) && plan.allprice.length > 0
        ? plan.allprice.map((p) => ({ currencyCode: p.currencyCode, price: String(p.price) }))
        : [{ currencyCode: "INR", price: "" }],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ================= EDIT VIDEO – form mein 'name' fill karo =================

  function handleVideoEdit(plan: VideoPlan) {
    setEditingVideoId(plan._id);
    setVideoForm({
      name: safeStr(plan.name),      // GET se 'name' aaya, form mein 'name' daalo
      duration: safeStr(plan.duration),
      prices: Array.isArray(plan.allprice) && plan.allprice.length > 0
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

        {/* ================= CATEGORY TABS ================= */}
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

        {/* ================= VIDEO FORM – 'name' field ================= */}
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

            {/* PRICES */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <strong>Prices</strong>
                <button
                  type="button"
                  onClick={addVideoPriceRow}
                  style={{
                    padding: "4px 14px",
                    borderRadius: 8,
                    background: "#111",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
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
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
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

        {/* ================= NON-VIDEO FORM (transformation / diet) ================= */}
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
                style={{
                  gridColumn: "1 / -1",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  fontSize: 14,
                  fontFamily: "inherit",
                  resize: "vertical",
                  minHeight: "100px",
                  backgroundColor: "#fafafa",
                }}
              />

              <textarea
                rows={3}
                required
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                style={{
                  gridColumn: "1 / -1",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  fontSize: 14,
                  fontFamily: "inherit",
                  resize: "vertical",
                  minHeight: "80px",
                  backgroundColor: "#fafafa",
                }}
              />
            </div>

            {/* PRICES */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <strong>Prices</strong>
                <button
                  type="button"
                  onClick={addPriceRow}
                  style={{
                    padding: "4px 14px",
                    borderRadius: 8,
                    background: "#111",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
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
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
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

        {/* ================= LIST ================= */}
        <div className="banner-section">
          <div className="section-header">
            <h2 style={{ textTransform: "capitalize" }}>{category} Plans</h2>
            <span className="count-badge">{isVideo ? videoPlans.length : plans.length}</span>
          </div>

          {isVideo ? (
            videoPlans.length === 0 ? (
              <div className="empty-state">No video plans found</div>
            ) : (
              <div className="banner-grid">
                {videoPlans.map((plan) => (
                  <VideoPlanCard
                    key={plan._id}
                    plan={plan}
                    onEdit={handleVideoEdit}
                    onDelete={handleVideoDelete}
                  />
                ))}
              </div>
            )
          ) : (
            plans.length === 0 ? (
              <div className="empty-state">No plans found</div>
            ) : (
              <div className="banner-grid">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan._id}
                    plan={plan}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
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
    <div className="banner-card">
      <div className="banner-card-body" style={{ padding: 20 }}>
        <div className="banner-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 12 }}>
          <button className="banner-icon-btn banner-edit-btn" onClick={() => onEdit(plan)} type="button">Edit</button>
          <button className="banner-icon-btn banner-delete-btn" onClick={() => onDelete(plan._id)} type="button">Delete</button>
        </div>

        <div className="banner-type" style={{ textTransform: "capitalize" }}>{plan.category}</div>
        <h3 style={{ margin: "8px 0 4px" }}>{plan.name}</h3>
        <p className="banner-duration">⏱ {plan.duration}</p>

        {Array.isArray(plan.allprice) && plan.allprice.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {plan.allprice.map((p, i) => (
              <span
                key={i}
                style={{
                  background: "#f4f4f4",
                  border: "1px solid #e0e0e0",
                  borderRadius: 10,
                  padding: "4px 12px",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#111",
                }}
              >
                {p.symbol || p.currencyCode} {p.price}
              </span>
            ))}
          </div>
        )}

        {plan.description && (
          <p style={{ marginTop: 10, lineHeight: 1.7, color: "#555", fontSize: 14 }}>{plan.description}</p>
        )}

        {Array.isArray(plan.features) && plan.features.length > 0 && (
          <ul style={{
            marginTop: 12,
            paddingLeft: 0,
            lineHeight: 1.9,
            fontSize: 14,
            color: "#444",
            listStyleType: "none",
          }}>
            {plan.features.map((f, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ color: "#22c55e", fontWeight: 700 }}>🟢</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ================= VIDEO PLAN CARD – 'name' display karega =================

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
    <div className="banner-card">
      <div className="banner-card-body" style={{ padding: 20 }}>
        <div className="banner-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 12 }}>
          <button className="banner-icon-btn banner-edit-btn" onClick={() => onEdit(plan)} type="button">Edit</button>
          <button className="banner-icon-btn banner-delete-btn" onClick={() => onDelete(plan._id)} type="button">Delete</button>
        </div>

        <div className="banner-type">Video</div>
        <h3 style={{ margin: "8px 0 4px" }}>{plan.name}</h3>   {/* ✅ 'name' display */}
        <p className="banner-duration">⏱ {plan.duration}</p>

        {Array.isArray(plan.allprice) && plan.allprice.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {plan.allprice.map((p, i) => (
              <span
                key={i}
                style={{
                  background: "#f4f4f4",
                  border: "1px solid #e0e0e0",
                  borderRadius: 10,
                  padding: "4px 12px",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#111",
                }}
              >
                {p.symbol || p.currencyCode} {p.price}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}