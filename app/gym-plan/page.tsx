"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import AdminShell from "../components/AdminShell";
import { apiRequest } from "../lib/api";

const VIDEO_PLANS_URL = "https://dinesh-sagel-backend.onrender.com/api/video-plans";

// ================= TYPES =================

type GymPlan = {
  _id: string;
  title: string;
  name: string;
  description: string;
  currencyCode?: string;
  price: number | string;
  duration: string;
  category: string;
  features: string[];
};

// ================= CURRENCY SYMBOL MAP =================

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  GBP: "£",
  EUR: "€",
  AED: "د.إ",
  AUD: "A$",
  CAD: "C$",
  SGD: "S$",
  SAR: "﷼",
  NZD: "NZ$",
};

function getCurrencySymbol(code: string): string {
  if (!code) return "₹";
  return CURRENCY_SYMBOLS[code.toUpperCase()] || code.toUpperCase();
}

// ================= EMPTY FORM =================

const emptyForm = {
  title: "",
  description: "",
  currencyCode: "INR",
  price: "",
  duration: "",
  category: "video",
  featuresInput: "",
};

// ================= EXTRACT DATA =================

function extractPlans(data: any): GymPlan[] {
  console.log("API RESPONSE =>", data);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.videoplans)) return data.videoplans;
  if (Array.isArray(data?.videoPlans)) return data.videoPlans;
  if (Array.isArray(data?.plans)) return data.plans;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.plans)) return data.data.plans;
  return [];
}

// ================= SAFE VALUE HELPERS =================

function safeString(val: any): string {
  if (val === null || val === undefined || val === "undefined") return "";
  return String(val);
}

function safePrice(val: any): string {
  const num = Number(val);
  if (isNaN(num)) return "0";
  return String(num);
}

// ================= PAGE =================

export default function GymPlanPage() {
  const [plans, setPlans] = useState<GymPlan[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadPlans(); }, []);

  // Category ya currencyCode change hone pe reload
  useEffect(() => { loadPlans(); }, [form.category, form.currencyCode]);

  // ================= GET DATA =================

  async function loadPlans() {
    try {
      const isVideo = form.category.toLowerCase() === "video";

      let data: any;

      if (isVideo) {
        // Video — currencyCode se filter
        const url = `${VIDEO_PLANS_URL}?currencyCode=${form.currencyCode || "INR"}`;
        const res = await fetch(url);
        data = await res.json();
      } else {
        data = await apiRequest<any>(`/api/plans/plans?category=${form.category}`);
      }

      console.log("LOADED DATA =>", data);
      setPlans(extractPlans(data));
    } catch (error) {
      console.log(error);
    }
  }

  // ================= SUBMIT =================

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);

      const isVideo = form.category.toLowerCase() === "video";

      const payload = isVideo
        ? {
            title: form.title,
            currencyCode: form.currencyCode || "INR",
            price: Number(form.price),
            duration: form.duration,
          }
        : {
            name: form.title,
            description: form.description,
            currencyCode: form.currencyCode || "INR",
            price: Number(form.price),
            duration: form.duration,
            category: form.category,
            features: form.featuresInput
              .split(",")
              .map((f) => f.trim())
              .filter(Boolean),
          };

      console.log("PAYLOAD =>", payload);

      if (isVideo) {
        if (!editingId) {
          await fetch(VIDEO_PLANS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } else {
          await fetch(`${VIDEO_PLANS_URL}/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      } else {
        if (!editingId) {
          await apiRequest("/api/plans/plans", { method: "POST", body: payload });
        } else {
          await apiRequest(`/api/plans/plans/${editingId}`, { method: "PUT", body: payload });
        }
      }

      setForm({ ...emptyForm, category: form.category, currencyCode: form.currencyCode });
      setEditingId("");
      loadPlans();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  // ================= EDIT =================

  function handleEdit(plan: GymPlan) {
    setEditingId(plan._id);
    setForm({
      title: safeString(plan.title || plan.name),
      description: safeString(plan.description),
      price: safePrice(plan.price),
      duration: safeString(plan.duration),
      category: safeString(plan.category) || "video",
      featuresInput: Array.isArray(plan.features) ? plan.features.join(", ") : "",
      currencyCode: safeString(plan.currencyCode) || "INR",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ================= DELETE =================

  async function handleDelete(id: string) {
    try {
      const isVideo = form.category.toLowerCase() === "video";
      if (isVideo) {
        await fetch(`${VIDEO_PLANS_URL}/${id}`, { method: "DELETE" });
      } else {
        await apiRequest(`/api/plans/plans/${id}`, { method: "DELETE" });
      }
      loadPlans();
    } catch (error) {
      console.log(error);
    }
  }

  const isVideo = form.category.toLowerCase() === "video";

  // ================= UI =================

  return (
    <AdminShell>
      <section className="banner-page">

        {/* ================= FORM ================= */}

        <form className="banner-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Update Plan" : "Create Plan"}</h2>

          <div className="banner-form-grid">

            {/* TITLE */}
            <input
              required
              placeholder="Plan Title"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />

            {/* CURRENCY CODE DROPDOWN */}
            <select
              value={form.currencyCode}
              onChange={(e) => setForm((prev) => ({ ...prev, currencyCode: e.target.value }))}
            >
              <option value="INR">INR — ₹ Indian Rupee</option>
              <option value="USD">USD — $ US Dollar</option>
              <option value="GBP">GBP — £ British Pound</option>
              <option value="EUR">EUR — € Euro</option>
              <option value="AED">AED — د.إ UAE Dirham</option>
              <option value="AUD">AUD — A$ Australian Dollar</option>
              <option value="CAD">CAD — C$ Canadian Dollar</option>
              <option value="SGD">SGD — S$ Singapore Dollar</option>
              <option value="SAR">SAR — ﷼ Saudi Riyal</option>
              <option value="NZD">NZD — NZ$ New Zealand Dollar</option>
            </select>

            {/* PRICE */}
            <input
              required
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            />

            {/* DURATION */}
            <input
              required
              placeholder="Duration"
              value={form.duration}
              onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
            />

            {/* CATEGORY */}
            <select
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            >
              <option value="video">Video</option>
              <option value="diet">Diet</option>
              <option value="transformation">Transformation</option>
            </select>

            {/* VIDEO KE ALAWA */}
            {!isVideo && (
              <>
                <input
                  placeholder="Features comma separated"
                  value={form.featuresInput}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, featuresInput: e.target.value }))
                  }
                />
                <textarea
                  rows={4}
                  required
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </>
            )}
          </div>

          <button className="submit-btn" disabled={loading} type="submit">
            {loading ? "Please wait..." : editingId ? "Update Plan" : "Create Plan"}
          </button>
        </form>

        {/* ================= LIST ================= */}

        <div className="banner-section">
          <div className="section-header">
            <h2>
              {form.category.charAt(0).toUpperCase() + form.category.slice(1)} Plans
              {isVideo && (
                <span style={{ fontSize: "14px", fontWeight: 400, marginLeft: "8px", color: "#888" }}>
                  ({form.currencyCode})
                </span>
              )}
            </h2>
            <span className="count-badge">{plans.length}</span>
          </div>

          {plans.length === 0 ? (
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
          )}
        </div>

      </section>
    </AdminShell>
  );
}

// ================= CARD =================

function PlanCard({
  plan,
  onEdit,
  onDelete,
}: {
  plan: GymPlan;
  onEdit: (plan: GymPlan) => void;
  onDelete: (id: string) => void;
}) {
  const displayName = safeString(plan.title || plan.name);
  const displayPrice = safePrice(plan.price);
  const displayDuration = safeString(plan.duration);
  const displayCategory = safeString(plan.category);
  const displayCurrencyCode = safeString(plan.currencyCode) || "INR";
  const currencySymbol = getCurrencySymbol(displayCurrencyCode);
  const isVideo = displayCategory.toLowerCase() === "video";

  return (
    <div className="banner-card">
      <div className="banner-card-body" style={{ padding: "20px" }}>

        {/* ACTIONS */}
        <div className="banner-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "12px" }}>
          <button className="banner-icon-btn banner-edit-btn" onClick={() => onEdit(plan)} type="button">Edit</button>
          <button className="banner-icon-btn banner-delete-btn" onClick={() => onDelete(plan._id)} type="button">Delete</button>
        </div>

        {/* CATEGORY */}
        <div className="banner-type">
          {displayCategory.charAt(0).toUpperCase() + displayCategory.slice(1)}
        </div>

        {/* TITLE */}
        <h3>{displayName}</h3>

        {/* CURRENCY BADGE */}
        <span style={{
          display: "inline-block",
          marginTop: "6px",
          padding: "2px 10px",
          background: "#f0f0f0",
          borderRadius: "20px",
          fontSize: "11px",
          fontWeight: 700,
          color: "#555",
          letterSpacing: "0.05em",
        }}>
          {displayCurrencyCode}
        </span>

        {/* PRICE */}
        <p style={{ fontWeight: 700, fontSize: "20px", margin: "8px 0" }}>
          {currencySymbol} {displayPrice}
        </p>

        {/* DURATION */}
        <p className="banner-duration">⏱ {displayDuration}</p>

        {/* VIDEO KE ALAWA */}
        {!isVideo && (
          <>
            <p style={{ marginTop: "10px", lineHeight: "1.7", color: "#555" }}>
              {safeString(plan.description)}
            </p>
            {Array.isArray(plan.features) && plan.features.length > 0 && (
              <ul style={{ marginTop: "14px", paddingLeft: "20px", lineHeight: "1.8" }}>
                {plan.features.map((feature, index) => (
                  <li key={index}>✓ {safeString(feature)}</li>
                ))}
              </ul>
            )}
          </>
        )}

      </div>
    </div>
  );
}