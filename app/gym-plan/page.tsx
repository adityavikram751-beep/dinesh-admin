"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import AdminShell from "../components/AdminShell";
import { apiRequest } from "../lib/api";

// ================= TYPES =================

type GymPlan = {
  _id: string;
  title: string;
  name: string;
  description: string;
  price: number | string;
  duration: string;
  category: string;
  features: string[];
};

// ================= EMPTY FORM =================

const emptyForm = {
  title: "",
  description: "",
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
  useEffect(() => { loadPlans(); }, [form.category]);

  // ================= GET DATA =================

  async function loadPlans() {
    try {
      const isVideo = form.category.toLowerCase() === "video";
      const endpoint = isVideo
        ? "/api/video-plans"
        : `/api/plans/plans?category=${form.category}`;

      const data = await apiRequest<any>(endpoint);
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
            price: Number(form.price),
            duration: form.duration,
          }
        : {
            name: form.title,
            description: form.description,
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
          await apiRequest("/api/video-plans", { method: "POST", body: payload });
        } else {
          await apiRequest(`/api/video-plans/${editingId}`, { method: "PUT", body: payload });
        }
      } else {
        if (!editingId) {
          await apiRequest("/api/plans/plans", { method: "POST", body: payload });
        } else {
          await apiRequest(`/api/plans/plans/${editingId}`, { method: "PUT", body: payload });
        }
      }

      setForm({ ...emptyForm, category: form.category });
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
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ================= DELETE =================

  async function handleDelete(id: string) {
    try {
      const isVideo = form.category.toLowerCase() === "video";
      const endpoint = isVideo ? `/api/video-plans/${id}` : `/api/plans/plans/${id}`;
      await apiRequest(endpoint, { method: "DELETE" });
      loadPlans();
    } catch (error) {
      console.log(error);
    }
  }

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
            {form.category.toLowerCase() !== "video" && (
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
  const isVideo = displayCategory.toLowerCase() === "video";

  return (
    <div className="banner-card">
      <div className="banner-card-body" style={{ padding: "20px" }}>

        {/* ACTIONS */}
        <div
          className="banner-actions"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <button
            className="banner-icon-btn banner-edit-btn"
            onClick={() => onEdit(plan)}
            type="button"
          >
            Edit
          </button>
          <button
            className="banner-icon-btn banner-delete-btn"
            onClick={() => onDelete(plan._id)}
            type="button"
          >
            Delete
          </button>
        </div>

        {/* CATEGORY */}
        <div className="banner-type">
          {displayCategory.charAt(0).toUpperCase() + displayCategory.slice(1)}
        </div>

        {/* TITLE */}
        <h3>{displayName}</h3>

        {/* PRICE */}
        <p style={{ fontWeight: 700, fontSize: "20px", margin: "8px 0" }}>
          ₹ {displayPrice}
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