"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import AdminShell from "../components/AdminShell";
import { apiRequest } from "../lib/api";

type Banner = {
  _id?: string;
  title?: string;
  description?: string;
  duration?: string;
  imageUrl?: string;
  public_id?: string;
  bannerfor?: string;
};

const emptyForm = {
  title: "",
  description: "",
  duration: "",
  bannerfor: "home",
};

export default function BannerPage() {
  const [homeBanners, setHomeBanners] = useState<Banner[]>([]);
  const [transformationBanners, setTransformationBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    try {
      const homeData = await apiRequest<any>("/api/banners?bannerfor=home");
      const transformationData = await apiRequest<any>("/api/banners?bannerfor=transformation");

      setHomeBanners(
        Array.isArray(homeData) ? homeData : homeData?.banners || []
      );
      setTransformationBanners(
        Array.isArray(transformationData)
          ? transformationData
          : transformationData?.banners || []
      );
    } catch (error) {
      console.log(error);
    }
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("bannerfor", form.bannerfor);
      if (form.bannerfor === "transformation") {
        formData.append("duration", form.duration);
      }
      if (imageFile) formData.append("image", imageFile);

      if (!editingId) {
        await apiRequest("/api/banners", { method: "POST", body: formData });
      } else {
        await apiRequest(`/api/banners/${editingId}`, {
          method: "PUT",
          body: formData,
        });
      }

      setForm(emptyForm);
      setEditingId("");
      setImageFile(null);
      setPreview("");
      loadBanners();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(item: Banner) {
    setEditingId(item._id || "");
    setForm({
      title: item.title || "",
      description: item.description || "",
      duration: item.duration || "",
      bannerfor: item.bannerfor || "home",
    });
    setPreview(item.imageUrl || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    try {
      await apiRequest(`/api/banners/${id}`, { method: "DELETE" });
      loadBanners();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <AdminShell>
      <section className="banner-page">
        <form className="banner-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Update Banner" : "Create Banner"}</h2>

          <div className="banner-form-grid">
            <input
              required
              placeholder="Banner title"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
            />

            <select
              value={form.bannerfor}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bannerfor: e.target.value }))
              }
            >
              <option value="home">Homepage</option>
              <option value="transformation">Transformation</option>
            </select>

            {form.bannerfor === "transformation" && (
              <>
                <textarea
                  rows={4}
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />

                <input
                  placeholder="Duration (e.g. 4 Weeks, 3 Months)"
                  value={form.duration}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, duration: e.target.value }))
                  }
                />
              </>
            )}

            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          {preview && (
            <img src={preview} alt="Preview" className="preview-image" />
          )}

          <button className="submit-btn" disabled={loading} type="submit">
            {loading
              ? "Please wait..."
              : editingId
                ? "Update Banner"
                : "Create Banner"}
          </button>
        </form>

        <div className="banner-section">
          <div className="section-header">
            <h2>Homepage Banners</h2>
            <span className="count-badge">{homeBanners.length}</span>
          </div>

          {homeBanners.length === 0 ? (
            <div className="empty-state">No homepage banners yet.</div>
          ) : (
            <div className="banner-grid">
              {homeBanners.map((item) => (
                <BannerCard
                  key={item._id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        <div className="banner-section">
          <div className="section-header">
            <h2>Transformation Banners</h2>
            <span className="count-badge">{transformationBanners.length}</span>
          </div>

          {transformationBanners.length === 0 ? (
            <div className="empty-state">No transformation banners yet.</div>
          ) : (
            <div className="banner-grid">
              {transformationBanners.map((item) => (
                <BannerCard
                  key={item._id}
                  item={item}
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

function BannerCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Banner;
  onEdit: (item: Banner) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="banner-card">
      <div className="banner-image-wrap">
        <img src={item.imageUrl} alt={item.title || "Banner"} />
        <div className="banner-actions">
          <button
            className="banner-icon-btn banner-edit-btn"
            onClick={() => onEdit(item)}
            type="button"
            aria-label="Edit banner"
            title="Edit"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
          <button
            className="banner-icon-btn banner-delete-btn"
            onClick={() => onDelete(item._id!)}
            type="button"
            aria-label="Delete banner"
            title="Delete"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="banner-card-body">
        <div className="banner-type">
          {item.bannerfor === "transformation" ? "Transformation" : "Homepage"}
        </div>

        <h3>{item.title}</h3>

        {item.description && <p>{item.description}</p>}

        {item.bannerfor === "transformation" && item.duration && (
          <p className="banner-duration">⏱ {item.duration}</p>
        )}
      </div>
    </div>
  );
}