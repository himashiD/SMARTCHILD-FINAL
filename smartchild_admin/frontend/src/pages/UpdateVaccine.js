// src/pages/UpdateVaccine.js
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/updatevaccine.css";

const API = process.env.REACT_APP_API || "http://localhost:5000";

/** Try multiple endpoints until one works (e.g., /api/vaccines/:id or /vaccines/:id) */
async function fetchWithFallback(method, paths, data, config) {
  let lastErr;
  for (const url of paths) {
    try {
      if (method === "get") return await axios.get(url, config);
      if (method === "put") return await axios.put(url, data, config);
    } catch (e) {
      lastErr = e;
      // 404/405/500 - try next; network errors too
    }
  }
  throw lastErr;
}

export default function UpdateVaccine() {
  const { id } = useParams();
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    dose: "",
    age_weeks: "",
    description: "",
    manufacturer: "",
    batch_number: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fileRef = useRef(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        setIsLoading(true);
        const { data } = await fetchWithFallback(
          "get",
          [`${API}/api/vaccines/${id}`, `${API}/vaccines/${id}`],
          null,
          {}
        );

        if (!mounted.current) return;

        setForm({
          name: data.name || "",
          dose: data.dose || "",
          age_weeks: data.age_weeks != null ? String(data.age_weeks) : "",
          description: data.description || "",
          manufacturer: data.manufacturer || "",
          batch_number: data.batch_number || "",
        });
        setCurrentImage(
          data.vaccine_image
            ? `${API}/uploads/${data.vaccine_image}`
            : data.image_path
            ? `${API}/${String(data.image_path).replace(/^\/?/, "")}`
            : null
        );
      } catch (err) {
        console.error("Error fetching vaccine:", err);
        alert(
          err?.response?.data?.message ||
            "Failed to load vaccine data. Please try again."
        );
      } finally {
        if (mounted.current) setIsLoading(false);
      }
    })();

    return () => {
      mounted.current = false;
    };
  }, [id]);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validateForm = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Vaccine name is required";
    if (!form.dose.trim()) e.dose = "Dose information is required";

    if (!form.age_weeks.toString().trim()) {
      e.age_weeks = "Age in weeks is required";
    } else if (Number.isNaN(Number(form.age_weeks))) {
      e.age_weeks = "Age must be a valid number";
    } else if (Number(form.age_weeks) < 0) {
      e.age_weeks = "Age must be ≥ 0";
    }

    if (!form.description.trim()) e.description = "Description is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onFile = (ev) => {
    const f = ev.target.files?.[0];
    setFile(f || null);

    if (f) {
      // Optional: size/type checks
      const maxMB = 5;
      if (f.size > maxMB * 1024 * 1024) {
        alert(`Image too large. Max ${maxMB}MB.`);
        setFile(null);
        setPreview(null);
        return;
      }
      const r = new FileReader();
      r.onload = () => setPreview(r.result);
      r.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const triggerFileUpload = () => fileRef.current?.click();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const fd = new FormData();
      // normalize payload
      Object.entries({
        ...form,
        age_weeks: String(form.age_weeks).trim(),
      }).forEach(([k, v]) => fd.append(k, v ?? ""));
      if (file) fd.append("vaccine_image", file);

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      await fetchWithFallback(
        "put",
        [`${API}/api/vaccines/${id}`, `${API}/vaccines/${id}`],
        fd,
        config
      );

      nav("/vaccines");
    } catch (err) {
      console.error("Error updating vaccine:", err);
      alert(
        err?.response?.data?.message ||
          "Error updating vaccine. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <svg className="loading-spinner large" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p>Loading vaccine information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <span className="breadcrumb-item">Dashboard</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item">Vaccine Management</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item active">Update Vaccine</span>
      </nav>

      {/* Main Card */}
      <div className="form-card">
        {/* Header */}
        <div className="form-header">
          <div className="form-title-section">
            <div className="form-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <h1 className="form-title">UPDATE VACCINE INFORMATION</h1>
              <p className="form-subtitle">
                Modify vaccine details and administration information
              </p>
            </div>
          </div>
          <div className="form-meta">
            <div className="form-id">Vaccine ID: {id}</div>
            <div className="form-date">Date: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="registration-form">
          {/* Image */}
          <div className="photo-section">
            <div className="section-header">
              <div className="section-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h2 className="section-title">VACCINE IMAGE ATTACHMENT</h2>
            </div>

            <div className="photo-upload-container">
              <div className="photo-upload-area" onClick={triggerFileUpload}>
                {preview || currentImage ? (
                  <img
                    src={preview || currentImage}
                    alt="Vaccine preview"
                    className="photo-preview"
                  />
                ) : (
                  <div className="photo-placeholder">
                    <svg
                      className="camera-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="photo-controls">
                <button type="button" className="attach-btn" onClick={triggerFileUpload}>
                  {preview || currentImage ? "CHANGE IMAGE" : "ATTACH IMAGE"}
                </button>
                <div className="photo-requirements">
                  <div className="requirement-title">Requirements:</div>
                  <div className="requirement-item">• Format: JPEG, PNG</div>
                  <div className="requirement-item">• Size: Maximum 5MB</div>
                  <div className="requirement-item">
                    • Clear image of vaccine vial/package
                  </div>
                </div>
              </div>
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={onFile}
              className="file-input-hidden"
            />
          </div>

          {/* Section A */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">SECTION A: BASIC VACCINE INFORMATION</h2>
              <p className="section-subtitle">
                Update essential vaccine details and administration data
              </p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  VACCINE NAME <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <input
                    className={`form-input ${errors.name ? "error" : ""}`}
                    placeholder="Enter vaccine name (e.g., BCG, Hepatitis B)"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </div>
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  DOSE INFORMATION <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <input
                    className={`form-input ${errors.dose ? "error" : ""}`}
                    placeholder="Enter dose (e.g., 0.5ml, 1st dose, Booster)"
                    value={form.dose}
                    onChange={(e) => set("dose", e.target.value)}
                  />
                </div>
                {errors.dose && <span className="error-text">{errors.dose}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  AGE IN WEEKS <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <input
                    className={`form-input ${errors.age_weeks ? "error" : ""}`}
                    type="number"
                    inputMode="numeric"
                    placeholder="Enter age in weeks (e.g., 6, 10, 14)"
                    value={form.age_weeks}
                    onChange={(e) => set("age_weeks", e.target.value)}
                  />
                </div>
                {errors.age_weeks && (
                  <span className="error-text">{errors.age_weeks}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">MANUFACTURER</label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <input
                    className="form-input"
                    placeholder="Enter manufacturer name (e.g., GSK, Pfizer)"
                    value={form.manufacturer}
                    onChange={(e) => set("manufacturer", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">BATCH NUMBER</label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                    />
                  </svg>
                  <input
                    className="form-input"
                    placeholder="Enter batch/lot number"
                    value={form.batch_number}
                    onChange={(e) => set("batch_number", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section B */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">SECTION B: ADDITIONAL INFORMATION</h2>
              <p className="section-subtitle">
                Detailed description and administration notes
              </p>
            </div>

            <div className="form-grid">
              <div className="form-group form-group-full">
                <label className="form-label">
                  DESCRIPTION & NOTES <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <svg className="input-icon textarea-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <textarea
                    className={`form-textarea ${errors.description ? "error" : ""}`}
                    placeholder="Enter vaccine description, purpose, side effects, and administration notes..."
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    rows={5}
                  />
                </div>
                {errors.description && (
                  <span className="error-text">{errors.description}</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => nav("/vaccines")}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? (
                <>
                  <svg className="loading-spinner" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Updating...
                </>
              ) : (
                "Update Vaccine"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
