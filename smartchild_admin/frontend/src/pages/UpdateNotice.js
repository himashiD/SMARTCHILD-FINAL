import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/updatenotice.css";

/** Pick the ONE that matches your server:
 *  - If routes look like http://localhost:5000/api/notices/:id  => keep /api
 *  - If routes look like http://localhost:5000/notices/:id      => remove /api
 */
const API_BASE = process.env.REACT_APP_API || "http://localhost:5000";  // <- base
const WITH_API_PREFIX = true; // set to false if your server is NOT using /api
const API = WITH_API_PREFIX ? `${API_BASE}/api` : API_BASE;

// normalize any date-ish input to YYYY-MM-DD for <input type="date">
const toYMD = (d) => {
  if (!d) return "";
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  try {
    const dt = new Date(d);
    if (Number.isNaN(+dt)) return "";
    return dt.toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

export default function UpdateNotice() {
  const { id } = useParams();
  const nav = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    notice_title: "",
    notice_description: "",
    notice_date: "",
    notice_start_time: "",
    notice_end_time: "",
    notice_venue: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const setField = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validateForm = () => {
    const e = {};
    if (!form.notice_title.trim()) e.notice_title = "Notice title is required";
    if (!form.notice_date) e.notice_date = "Notice date is required";
    if (!form.notice_start_time) e.notice_start_time = "Start time is required";
    if (!form.notice_end_time) e.notice_end_time = "End time is required";
    if (!form.notice_venue.trim()) e.notice_venue = "Venue is required";
    if (!form.notice_description.trim()) e.notice_description = "Description is required";
    if (form.notice_start_time && form.notice_end_time && form.notice_start_time >= form.notice_end_time) {
      e.notice_end_time = "End time must be after start time";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    (async () => {
      try {
        setIsLoadingData(true);
        // GET /notices/:id (with or without /api depending on flag)
        const { data } = await axios.get(`${API}/notices/${id}`);

        setForm({
          notice_title: data.notice_title || "",
          notice_description: data.notice_description ?? "",
          notice_date: toYMD(data.notice_date),
          notice_start_time: (data.notice_start_time || "").slice(0, 5),
          notice_end_time: (data.notice_end_time || "").slice(0, 5),
          notice_venue: data.notice_venue || "",
        });

        // existing image path (your server should serve /uploads)
        setCurrentImage(
          data.notice_image ? `${API_BASE}/uploads/${String(data.notice_image).replace(/^\/?/, "")}` : null
        );
      } catch (err) {
        console.error("Error loading notice:", err);
        alert(err?.response?.data?.message || "Failed to load notice.");
      } finally {
        setIsLoadingData(false);
      }
    })();
  }, [id]);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    if (f && f.type.startsWith("image/")) {
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

    setIsLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""));
      if (file) fd.append("notice_image", file); // backend keeps existing image if no file

      // IMPORTANT: don't set Content-Type; Axios sets boundary for FormData
      await axios.put(`${API}/notices/${id}`, fd);

      nav("/notices");
    } catch (err) {
      console.error("Error updating notice:", err);
      alert(err?.response?.data?.message || "Failed to update notice.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <svg className="loading-spinner-large" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p>Loading notice data...</p>
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
        <span className="breadcrumb-item">Notice Management</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item active">Update Notice</span>
      </nav>

      {/* Card */}
      <div className="form-card">
        <div className="form-header">
          <div className="form-title-section">
            <div className="form-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="form-title">NOTICE UPDATE FORM</h1>
              <p className="form-subtitle">Modify notice information in the system</p>
            </div>
          </div>
          <div className="form-meta">
            <div className="form-id">Notice ID: {id}</div>
            <div className="form-date">Updated: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="registration-form">
          {/* Image */}
          <div className="photo-section">
            <div className="section-header">
              <div className="section-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="section-title">NOTICE IMAGE ATTACHMENT</h2>
            </div>

            <div className="photo-upload-container">
              <div className="photo-upload-area" onClick={triggerFileUpload}>
                {preview || currentImage ? (
                  <img src={preview || currentImage} alt="Notice preview" className="photo-preview" />
                ) : (
                  <div className="photo-placeholder">
                    <svg className="camera-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="photo-controls">
                <button type="button" className="attach-btn" onClick={triggerFileUpload}>
                  {preview ? "CHANGE IMAGE" : currentImage ? "UPDATE IMAGE" : "ATTACH IMAGE"}
                </button>
                <div className="photo-requirements">
                  <div className="requirement-title">Requirements:</div>
                  <div className="requirement-item">• Format: JPEG, PNG</div>
                  <div className="requirement-item">• Size: Maximum 5MB</div>
                  <div className="requirement-item">• Clear notice or announcement image</div>
                  {currentImage && !preview && (
                    <div className="current-image-info">
                      <div className="requirement-item">• Current image will be kept if no new image is selected</div>
                    </div>
                  )}
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
              <h2 className="section-title">SECTION A: NOTICE INFORMATION</h2>
              <p className="section-subtitle">Update the notice details and specifications</p>
            </div>

            <div className="form-grid">
              <div className="form-group form-group-full">
                <label className="form-label">NOTICE TITLE <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                  <input
                    className={`form-input ${errors.notice_title ? "error" : ""}`}
                    placeholder="Enter notice title (e.g., Health Checkup)"
                    value={form.notice_title}
                    onChange={(e) => setField("notice_title", e.target.value)}
                  />
                </div>
                {errors.notice_title && <span className="error-text">{errors.notice_title}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">NOTICE DATE <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input
                    className={`form-input ${errors.notice_date ? "error" : ""}`}
                    type="date"
                    value={form.notice_date}
                    onChange={(e) => setField("notice_date", e.target.value)}
                  />
                </div>
                {errors.notice_date && <span className="error-text">{errors.notice_date}</span>}
                <div className="form-note">Select the date when this notice will be active</div>
              </div>

              <div className="form-group">
                <label className="form-label">VENUE <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    className={`form-input ${errors.notice_venue ? "error" : ""}`}
                    placeholder="Enter venue location (e.g., Main Hall)"
                    value={form.notice_venue}
                    onChange={(e) => setField("notice_venue", e.target.value)}
                  />
                </div>
                {errors.notice_venue && <span className="error-text">{errors.notice_venue}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">START TIME <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <input
                    className={`form-input ${errors.notice_start_time ? "error" : ""}`}
                    type="time"
                    value={form.notice_start_time}
                    onChange={(e) => setField("notice_start_time", e.target.value)}
                  />
                </div>
                {errors.notice_start_time && <span className="error-text">{errors.notice_start_time}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">END TIME <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <input
                    className={`form-input ${errors.notice_end_time ? "error" : ""}`}
                    type="time"
                    value={form.notice_end_time}
                    onChange={(e) => setField("notice_end_time", e.target.value)}
                  />
                </div>
                {errors.notice_end_time && <span className="error-text">{errors.notice_end_time}</span>}
              </div>

              <div className="form-group form-group-full">
                <label className="form-label">DESCRIPTION & DETAILS <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon textarea-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <textarea
                    className={`form-textarea ${errors.notice_description ? "error" : ""}`}
                    placeholder="Enter notice description, purpose, requirements, and any important details..."
                    value={form.notice_description}
                    onChange={(e) => setField("notice_description", e.target.value)}
                    rows={4}
                  />
                </div>
                {errors.notice_description && <span className="error-text">{errors.notice_description}</span>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => nav("/notices")} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg className="loading-spinner" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating Notice...
                </>
              ) : (
                <>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Update Notice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
