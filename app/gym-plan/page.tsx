"use client";

import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";

type GymPlan = {
  _id: string;
  title: string;
  price: string;
  duration: string;
  description: string;
};

export default function GymPlanPage() {
  const [plans, setPlans] =
    useState<GymPlan[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({
      title: "",
      price: "",
      duration: "",
      description: "",
    });

  // ================= LOAD PLANS =================

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    try {
      const response =
        await fetch(
          "http://localhost:5000/api/gym-plan"
        );

      const data =
        await response.json();

      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // ================= CREATE PLAN =================

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    try {
      setLoading(true);

      const response =
        await fetch(
          "http://localhost:5000/api/gym-plan",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              form
            ),
          }
        );

      const data =
        await response.json();

      if (data.success) {
        setForm({
          title: "",
          price: "",
          duration: "",
          description: "",
        });

        loadPlans();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  // ================= DELETE PLAN =================

  async function handleDelete(
    id: string
  ) {
    try {
      await fetch(
        `http://localhost:5000/api/gym-plan/${id}`,
        {
          method: "DELETE",
        }
      );

      loadPlans();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <AdminShell>
      <div
        style={{
          padding: "24px",
        }}
      >
        {/* ================= FORM ================= */}

        <div
          style={{
            background:
              "#fff",
            padding: "24px",
            borderRadius:
              "20px",
            marginBottom:
              "30px",
            boxShadow:
              "0 5px 20px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "700",
              marginBottom:
                "20px",
            }}
          >
            Create Gym Plan
          </h2>

          <form
            onSubmit={
              handleSubmit
            }
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(250px,1fr))",
                gap: "16px",
              }}
            >
              <input
                type="text"
                placeholder="Plan Title"
                value={form.title}
                onChange={(
                  e
                ) =>
                  setForm({
                    ...form,
                    title:
                      e.target
                        .value,
                  })
                }
                required
                style={
                  inputStyle
                }
              />

              <input
                type="text"
                placeholder="Price"
                value={form.price}
                onChange={(
                  e
                ) =>
                  setForm({
                    ...form,
                    price:
                      e.target
                        .value,
                  })
                }
                required
                style={
                  inputStyle
                }
              />

              <input
                type="text"
                placeholder="Duration"
                value={
                  form.duration
                }
                onChange={(
                  e
                ) =>
                  setForm({
                    ...form,
                    duration:
                      e.target
                        .value,
                  })
                }
                required
                style={
                  inputStyle
                }
              />
            </div>

            <textarea
              placeholder="Description"
              value={
                form.description
              }
              onChange={(
                e
              ) =>
                setForm({
                  ...form,
                  description:
                    e.target
                      .value,
                })
              }
              required
              style={{
                ...inputStyle,
                marginTop: "16px",
                minHeight:
                  "120px",
                resize: "none",
              }}
            />

            <button
              type="submit"
              disabled={
                loading
              }
              style={{
                marginTop:
                  "20px",
                height: "52px",
                padding:
                  "0 30px",
                border: "none",
                borderRadius:
                  "14px",
                background:
                  "#111827",
                color: "#fff",
                fontWeight:
                  "600",
                cursor:
                  "pointer",
              }}
            >
              {loading
                ? "Creating..."
                : "Create Plan"}
            </button>
          </form>
        </div>

        {/* ================= PLANS ================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(280px,1fr))",
            gap: "20px",
          }}
        >
          {plans.map((plan) => (
            <div
              key={plan._id}
              style={{
                background:
                  "#fff",
                borderRadius:
                  "20px",
                padding: "24px",
                boxShadow:
                  "0 5px 20px rgba(0,0,0,0.05)",
              }}
            >
              <h3
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  marginBottom:
                    "10px",
                }}
              >
                {plan.title}
              </h3>

              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom:
                    "8px",
                }}
              >
                ₹ {plan.price}
              </p>

              <p
                style={{
                  color: "#6b7280",
                  marginBottom:
                    "12px",
                }}
              >
                {plan.duration}
              </p>

              <p
                style={{
                  color: "#4b5563",
                  lineHeight:
                    "1.7",
                }}
              >
                {
                  plan.description
                }
              </p>

              <button
                onClick={() =>
                  handleDelete(
                    plan._id
                  )
                }
                style={{
                  marginTop:
                    "20px",
                  height: "46px",
                  padding:
                    "0 20px",
                  border: "none",
                  borderRadius:
                    "12px",
                  background:
                    "#dc2626",
                  color: "#fff",
                  fontWeight:
                    "600",
                  cursor:
                    "pointer",
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

// ================= INPUT STYLE =================

const inputStyle = {
  width: "100%",
  height: "52px",
  borderRadius: "14px",
  border: "1px solid #d1d5db",
  padding: "0 16px",
  fontSize: "15px",
  outline: "none",
} as React.CSSProperties;