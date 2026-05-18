"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import AdminShell from "../components/AdminShell";
import { icons } from "../components/Icons";
import { apiRequest } from "../lib/api";

// ================= TYPES =================

type Blog = {
  _id?: string;
  title?: string;
  content?: string;
  blogImage?: string;
  public_id?: string;
};

// ================= EMPTY FORM =================

const emptyForm = {
  title: "",
  content: "",
  blogImage: "",
  public_id: "",
};

// ================= HELPERS =================

function getBlogId(blog: Blog | null) {
  return blog?._id || "";
}

// ================= PAGE =================

export default function BlogPage() {
  const [blogs, setBlogs] = useState<
    Blog[]
  >([]);

  const [form, setForm] =
    useState(emptyForm);

  const [loading, setLoading] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [toast, setToast] =
    useState("");

  // ================= LOAD BLOGS =================

  useEffect(() => {
    loadBlogs();
  }, []);

  function showToast(message: string) {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2000);
  }

  async function loadBlogs() {
    try {
      const data = await apiRequest<any>(
        "/api/blogs/blogs"
      );

      const blogData =
        data?.blogs ||
        data?.data ||
        data ||
        [];

      setBlogs(blogData);
    } catch (error) {
      console.log(error);

      showToast(
        "Unable to load blogs"
      );
    }
  }

  // ================= IMAGE UPLOAD =================

  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      const token =
        localStorage.getItem(
          "fitadmin_token"
        );

      // ================= SIGNATURE API =================

      const signatureResponse =
        await fetch(
          "https://dinesh-sagel-backend.onrender.com/api/admin/auth/generate-upload-signature",
          {
            method: "POST",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const signatureJson =
        await signatureResponse.json();

      if (!signatureJson.success) {
        throw new Error(
          signatureJson.message
        );
      }

      // ================= SERVER DATA =================

      const uploadServerData =
        signatureJson.data;

      // ================= FORM DATA =================

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "api_key",
        uploadServerData.apiKey
      );

      formData.append(
        "timestamp",
        String(
          uploadServerData.timestamp
        )
      );

      formData.append(
        "signature",
        uploadServerData.signature
      );

      formData.append(
        "folder",
        uploadServerData.folder
      );

      formData.append(
        "public_id",
        uploadServerData.public_id
      );

      formData.append(
        "transformation",
        "c_fill,w_500,h_500"
      );

      // ================= CLOUDINARY =================

      const uploadResponse =
        await fetch(
          `https://api.cloudinary.com/v1_1/${uploadServerData.cloudName}/image/upload`,
          {
            method: "POST",

            body: formData,
          }
        );

      const uploadData =
        await uploadResponse.json();

      if (uploadData.error) {
        throw new Error(
          uploadData.error.message
        );
      }

      // ================= SAVE =================

      setForm((current) => ({
        ...current,

        blogImage:
          uploadData.secure_url,

        public_id:
          uploadData.public_id,
      }));

      showToast(
        "Image uploaded"
      );

      setUploading(false);
    } catch (error) {
      console.log(error);

      setUploading(false);

      showToast(
        error instanceof Error
          ? error.message
          : "Image upload failed"
      );
    }
  }

  // ================= SUBMIT =================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setLoading(true);

      if (!form.blogImage) {
        showToast(
          "Please upload image first"
        );

        setLoading(false);

        return;
      }

      // ================= PAYLOAD =================

      const payload = {
        title: form.title,

        content: form.content,

        blogImage:
          form.blogImage,

        public_id:
          form.public_id,
      };

      // ================= CREATE =================

      await apiRequest(
        "/api/blogs/blogs",
        {
          method: "POST",

          body: payload,
        }
      );

      showToast(
        "Blog created"
      );

      // ================= RESET =================

      setForm(emptyForm);

      await loadBlogs();
    } catch (error) {
      console.log(error);

      showToast(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  // ================= DELETE =================

  async function handleDelete(
    blog: Blog
  ) {
    const id = getBlogId(blog);

    if (!id) return;

    try {
      await apiRequest(
        `/api/blogs/blogs/${id}`,
        {
          method: "DELETE",
        }
      );

      showToast(
        "Blog deleted"
      );

      await loadBlogs();
    } catch (error) {
      console.log(error);

      showToast(
        "Delete failed"
      );
    }
  }

  return (
    <AdminShell>
      <section className="contact-info-wrap">
        {/* ================= FORM ================= */}

        <form
          className="card section contact-info-card"
          onSubmit={handleSubmit}
          style={{
            padding: "30px",

            borderRadius: "24px",

            marginBottom: "30px",

            background: "#fff",

            boxShadow:
              "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            style={{
              fontSize: "30px",

              marginBottom: "24px",

              fontWeight: "700",

              color: "#111827",
            }}
          >
            Create Blog
          </h2>

          <div
            className="form-grid"
            style={{
              gap: "24px",
            }}
          >
            {/* TITLE */}

            <label className="field">
              <span>Title</span>

              <input
                required
                type="text"
                placeholder="Blog title"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title:
                      event.target.value,
                  }))
                }
              />
            </label>

            {/* CONTENT */}

            <label className="field wide">
              <span>Content</span>

              <textarea
                required
                placeholder="Blog content"
                value={form.content}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    content:
                      event.target.value,
                  }))
                }
                style={{
                  minHeight: "220px",
                }}
              />
            </label>

            {/* IMAGE */}

            <label className="field wide">
              <span>Upload Image</span>

              <input
                type="file"
                accept="image/*"
                onChange={
                  handleImageUpload
                }
              />
            </label>

            {/* IMAGE PREVIEW */}

            {form.blogImage && (
              <div
                style={{
                  marginTop: "10px",
                }}
              >
                <img
                  src={form.blogImage}
                  alt="preview"
                  style={{
                    width: "320px",

                    height: "220px",

                    objectFit: "cover",

                    borderRadius: "18px",

                    maxWidth: "100%",
                  }}
                />
              </div>
            )}
          </div>

          {/* BUTTON */}

          <div
            className="actions"
            style={{
              marginTop: "24px",
            }}
          >
            <button
              className="primary-btn"
              type="submit"
              disabled={
                loading || uploading
              }
              style={{
                padding:
                  "13px 24px",

                fontSize: "15px",

                borderRadius:
                  "10px",
              }}
            >
              {uploading
                ? "Uploading..."
                : "Submit"}
            </button>
          </div>
        </form>

        {/* ================= BLOG LIST ================= */}

        <div
          style={{
            display: "grid",

            // SCREENSHOT SIZE

            gridTemplateColumns:
              "repeat(auto-fit,minmax(340px,340px))",

            justifyContent: "start",

            gap: "24px",

            marginTop: "20px",
          }}
        >
          {blogs.map((blog) => (
            <div
              key={getBlogId(blog)}
              style={{
                background: "#fff",

                borderRadius: "22px",

                overflow: "hidden",

                boxShadow:
                  "0 8px 24px rgba(0,0,0,0.06)",

                width: "340px",

                maxWidth: "100%",
              }}
            >
              {/* ================= IMAGE ================= */}

              <div
                style={{
                  width: "100%",

                  // SAME AS SCREENSHOT

                  height: "390px",

                  background: "#f5f5f5",

                  overflow: "hidden",
                }}
              >
                <img
                  src={blog.blogImage}
                  alt={blog.title}
                  style={{
                    width: "100%",

                    height: "100%",

                    objectFit: "cover",

                    display: "block",
                  }}
                />
              </div>

              {/* ================= CONTENT ================= */}

              <div
                style={{
                  padding: "18px",
                }}
              >
               
                {/* TITLE */}

                <h3
                  style={{
                    fontSize:
                      "18px",

                    fontWeight:
                      "700",

                    color:
                      "#111827",

                    lineHeight:
                      "30px",

                    marginBottom:
                      "12px",
                  }}
                >
                  {blog.title}
                </h3>

                {/* CONTENT */}

                <p
                  style={{
                    fontSize:
                      "14px",

                    lineHeight:
                      "24px",

                    color:
                      "#6b7280",

                    display:
                      "-webkit-box",

                    WebkitLineClamp: 2,

                    WebkitBoxOrient:
                      "vertical",

                    overflow:
                      "hidden",

                    marginBottom:
                      "18px",
                  }}
                >
                  {blog.content}
                </p>

                {/* DELETE BUTTON */}

                <button
                  className="contact-delete-btn"
                  type="button"
                  onClick={() =>
                    handleDelete(blog)
                  }
                  style={{
                    padding:
                      "10px 16px",

                    fontSize: "13px",

                    borderRadius:
                      "10px",

                    display: "flex",

                    alignItems:
                      "center",

                    gap: "6px",

                    border: "none",

                    cursor: "pointer",
                  }}
                >
                  {icons.Trash}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ================= TOAST ================= */}

        {toast && (
          <div className="toast">
            {toast}
          </div>
        )}
      </section>
    </AdminShell>
  );
}