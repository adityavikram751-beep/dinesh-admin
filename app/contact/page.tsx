"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import AdminShell from "../components/AdminShell";
import { icons } from "../components/Icons";
import { apiRequest } from "../lib/api";

type ContactInfo = {
  id?: string;
  _id?: string;
  email?: string;
  emailAddress?: string;
  phone?: string | number;
  contact?: string | number;
  contactNo?: string | number;
  phoneNumber?: string | number;
  mobile?: string | number;
  address?: string;
  Address?: string;
};

const emptyForm = {
  email: "",
  phone: "",
  address: ""
};

function getContactId(contact: ContactInfo | null) {
  return contact?._id || contact?.id || "";
}

function normalizeContact(contact: ContactInfo): ContactInfo {
  return {
    ...contact,
    email: contact.email || contact.emailAddress || "",
    phone: String(contact.phone || contact.contact || contact.contactNo || contact.phoneNumber || contact.mobile || ""),
    address: contact.address || contact.Address || ""
  };
}

function contactPayload(formData: typeof emptyForm) {
  return {
    email: formData.email,
    emailAddress: formData.email,
    phone: formData.phone,
    contact: formData.phone,
    contactNo: formData.phone,
    address: formData.address,
    Address: formData.address
  };
}

function readContact(data: unknown): ContactInfo | null {
  if (Array.isArray(data)) {
    return data[0] ? normalizeContact(data[0] as ContactInfo) : null;
  }

  if (typeof data === "object" && data !== null) {
    const payload = data as Record<string, unknown>;
    const possibleValues = [payload.data, payload.value, payload.contactUs, payload.contact, payload.result];

    for (const value of possibleValues) {
      if (Array.isArray(value)) {
        return value[0] ? normalizeContact(value[0] as ContactInfo) : null;
      }

      if (typeof value === "object" && value !== null) {
        return normalizeContact(value as ContactInfo);
      }
    }

    return normalizeContact(payload as ContactInfo);
  }

  return null;
}

export default function ContactPage() {
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    loadContact();
  }, []);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  async function loadContact() {
    try {
      const data = await apiRequest<unknown>("/api/contactUs");
      const nextContact = readContact(data);
      setContact(nextContact);

      if (nextContact) {
        setForm({
          email: nextContact.email || "",
          phone: String(nextContact.phone || ""),
          address: nextContact.address || ""
        });
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to load contact");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const id = getContactId(contact);

      if (id) {
        await apiRequest(`/api/contactUs/${id}`, {
          method: "PUT",
          body: contactPayload(form)
        });
        showToast("Contact updated");
      } else {
        await apiRequest("/api/contactUs", {
          method: "POST",
          body: contactPayload(form)
        });
        showToast("Contact added");
      }

      setEditing(false);
      await loadContact();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function startEdit() {
    if (contact) {
      setForm({
        email: contact.email || "",
        phone: String(contact.phone || ""),
        address: contact.address || ""
      });
    }

    setEditing(true);
  }

  async function handleDelete() {
    const id = getContactId(contact);

    if (!id) {
      return;
    }

    setLoading(true);
    try {
      await apiRequest(`/api/contactUs/${id}`, {
        method: "DELETE"
      });
      setContact(null);
      setForm(emptyForm);
      setEditing(true);
      showToast("Contact deleted");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to delete contact");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell>
      <section className="contact-info-wrap">
        {editing || !contact ? (
          <form className="card section contact-info-card" onSubmit={handleSubmit}>
            <h2>Contact Us</h2>
            <div className="form-grid">
              <label className="field">
                <span>Email Address</span>
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="xyz@company.com"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>Phone</span>
                <input
                  required
                  name="phone"
                  placeholder="+91 1234567890"
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                />
              </label>
              <label className="field wide">
                <span>Address</span>
                <textarea
                  required
                  name="address"
                  placeholder="xyz street, city, country"
                  value={form.address}
                  onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                />
              </label>
            </div>
            <div className="actions">
              <button className="primary-btn" type="submit" disabled={loading}>
                {contact ? "Update" : "Submit"}
              </button>
              {contact && (
                <button className="secondary-btn" type="button" onClick={() => setEditing(false)} disabled={loading}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="card section contact-info-card">
            <div className="contact-card-actions">
              <button className="contact-edit-btn" type="button" onClick={startEdit}>
                {icons.Edit} Edit
              </button>
              <button className="contact-delete-btn" type="button" onClick={handleDelete} disabled={loading}>
                {icons.Trash} Delete
              </button>
            </div>
            <div className="contact-info-list">
              <div>
                <strong>Email Address:</strong>
                <p>{contact.email}</p>
              </div>
              <div>
                <strong>Phone:</strong>
                <p>{contact.phone}</p>
              </div>
              <div>
                <strong>Address:</strong>
                <p>{contact.address}</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
