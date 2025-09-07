import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/updatemedicalrecord.css";

const API = process.env.REACT_APP_API || "http://localhost:5000";

export default function UpdateMedicalRecord() {
  const { id } = useParams();
  const nav = useNavigate();
  const fileRef = useRef();

  const [form, setForm] = useState({
    child_id: "",
    visit_date: "",
    doctor_name: "",
    diagnosis: "",
    treatment: "",
    prescription: "",
    notes: "",
  });

  const [childInfo, setChildInfo] = useState(null);
  const [currentAttachment, setCurrentAttachment] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.visit_date) e.visit_date = "Visit date is required";
    if (!form.doctor_name.trim()) e.doctor_name = "Doctor name is required";
    if (!form.diagnosis.trim()) e.diagnosis = "Diagnosis is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Load record (and child) once
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // ✅ correct endpoint
        const { data } = await axios.get(`${API}/medical-records/${id}`);

        setForm({
          child_id: data.child_id ?? "",
          visit_date: (data.visit_date || "").slice(0, 10),
          doctor_name: data.doctor_name || "",
          diagnosis: data.diagnosis || "",
          treatment: data.treatment || "",
          prescription: data.prescription || "",
          notes: data.notes || "",
        });

        // Child info comes from the same endpoint (JOIN)
        setChildInfo({
          name: data.child_name || `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          dob: data.dob,
          email: data.email,
          child_id: data.child_id,
        });

        if (data.attachment) {
          // ✅ path from API is relative (e.g. uploads/medical-records/xyz.pdf)
          setCurrentAttachment(`${API}/${data.attachment}`);
        } else {
          setCurrentAttachment(null);
        }
      } catch (err) {
        console.error("Load record failed:", err);
        alert("Failed to load medical record.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f && f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v || ""));
      if (file) fd.append("attachment", file);

      // ✅ correct endpoint; don't set Content-Type manually for FormData
      await axios.put(`${API}/medical-records/${id}`, fd);

      nav(`/ViewMedicalRecord/${id}`);
    } catch (err) {
      console.error("Update failed:", err);
      const msg = err?.response?.data?.message || err.message || "Failed to update medical record.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <svg className="loading-spinner large" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p>Loading medical record…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <nav className="breadcrumb">
        <span className="breadcrumb-item">Dashboard</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item">Medical Records</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item active">Update Record</span>
      </nav>

      <div className="form-card">
        <div className="form-header">
          <div className="form-title-section">
            <div className="form-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="form-title">UPDATE MEDICAL RECORD</h1>
              <p className="form-subtitle">Modify medical examination details and information</p>
            </div>
          </div>
          <div className="form-meta">
            <div className="form-id">Record ID: {id}</div>
            <div className="form-date">Date: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="registration-form">
          {childInfo && (
            <div className="child-info-section">
              <div className="section-header">
                <div className="section-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="section-title">PATIENT INFORMATION</h2>
              </div>

              <div className="child-info-card">
                <div className="child-info-header">
                  <div className="child-info-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3>Patient Details</h3>
                </div>
                <div className="child-info-grid">
                  <div className="child-info-item">
                    <span className="info-label">Full Name:</span>
                    <span className="info-value">{childInfo.name}</span>
                  </div>
                  <div className="child-info-item">
                    <span className="info-label">Date of Birth:</span>
                    <span className="info-value">{childInfo.dob ? new Date(childInfo.dob).toLocaleDateString() : "-"}</span>
                  </div>
                  <div className="child-info-item">
                    <span className="info-label">Child ID:</span>
                    <span className="info-value">{childInfo.child_id}</span>
                  </div>
                  <div className="child-info-item">
                    <span className="info-label">Contact:</span>
                    <span className="info-value">{childInfo.email || "Not provided"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">SECTION A: BASIC INFORMATION</h2>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">CHILD ID</label>
                <div className="input-wrapper">
                  <input className="form-input" value={form.child_id} readOnly />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">VISIT DATE <span className="required">*</span></label>
                <div className="input-wrapper">
                  <input
                    className={`form-input ${errors.visit_date ? "error" : ""}`}
                    type="date"
                    value={form.visit_date}
                    onChange={(e) => set("visit_date", e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
                {errors.visit_date && <span className="error-text">{errors.visit_date}</span>}
              </div>

              <div className="form-group form-group-full">
                <label className="form-label">DOCTOR NAME <span className="required">*</span></label>
                <div className="input-wrapper">
                  <input
                    className={`form-input ${errors.doctor_name ? "error" : ""}`}
                    value={form.doctor_name}
                    onChange={(e) => set("doctor_name", e.target.value)}
                    placeholder="Dr. John Doe"
                  />
                </div>
                {errors.doctor_name && <span className="error-text">{errors.doctor_name}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">SECTION B: MEDICAL DETAILS</h2>
            </div>

            <div className="form-grid">
              <div className="form-group form-group-full">
                <label className="form-label">DIAGNOSIS <span className="required">*</span></label>
                <div className="input-wrapper">
                  <textarea
                    className={`form-textarea ${errors.diagnosis ? "error" : ""}`}
                    rows={3}
                    value={form.diagnosis}
                    onChange={(e) => set("diagnosis", e.target.value)}
                  />
                </div>
                {errors.diagnosis && <span className="error-text">{errors.diagnosis}</span>}
              </div>

              <div className="form-group form-group-full">
                <label className="form-label">TREATMENT PLAN</label>
                <div className="input-wrapper">
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={form.treatment}
                    onChange={(e) => set("treatment", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group form-group-full">
                <label className="form-label">PRESCRIPTION DETAILS</label>
                <div className="input-wrapper">
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={form.prescription}
                    onChange={(e) => set("prescription", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group form-group-full">
                <label className="form-label">ADDITIONAL NOTES</label>
                <div className="input-wrapper">
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">SECTION C: DOCUMENT ATTACHMENTS</h2>
            </div>

            <div className="attachment-section">
              <div className="attachment-upload-container">
                <div className="attachment-upload-area" onClick={() => fileRef.current?.click()}>
                  {preview ? (
                    <img src={preview} alt="New attachment preview" className="attachment-preview" />
                  ) : file ? (
                    <div className="file-preview">
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  ) : currentAttachment ? (
                    <div className="current-attachment">
                      <a href={currentAttachment} target="_blank" rel="noreferrer">Open current attachment</a>
                      <div className="attachment-note">Click to replace</div>
                    </div>
                  ) : (
                    <div className="attachment-placeholder">Click to attach document (PDF/DOC/Image)</div>
                  )}
                </div>

                <div className="attachment-controls">
                  <button type="button" className="attach-btn" onClick={() => fileRef.current?.click()}>
                    {file || currentAttachment ? "CHANGE ATTACHMENT" : "ATTACH DOCUMENT"}
                  </button>
                  {(file || currentAttachment) && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                        setCurrentAttachment(null); // clears existing on next save
                      }}
                    >
                      REMOVE ATTACHMENT
                    </button>
                  )}
                </div>
              </div>

              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                ref={fileRef}
                onChange={onFile}
                className="file-input-hidden"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => nav(`/ViewMedicalRecord/${id}`)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Updating..." : "Update Medical Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
