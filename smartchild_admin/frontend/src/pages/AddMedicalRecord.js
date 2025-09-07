import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/addmedicalrecord.css";

const API = process.env.REACT_APP_API || "http://localhost:5000";

export default function AddMedicalRecord() {
  const nav = useNavigate();
  const fileRef = useRef();

  // Search state
  const [childId, setChildId] = useState("");
  const [child, setChild] = useState(null);
  const [searchErr, setSearchErr] = useState("");
  const [searching, setSearching] = useState(false);

  // Form state
  const [form, setForm] = useState({
    visit_date: "",
    doctor_name: "",
    diagnosis: "",
    prescription: "",
    treatment: "",
    notes: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const e = {};
    if (!form.visit_date) e.visit_date = "Visit date is required";
    if (!form.doctor_name.trim()) e.doctor_name = "Doctor name is required";
    if (!form.diagnosis.trim()) e.diagnosis = "Diagnosis is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const findChild = async () => {
    try {
      setSearchErr("");
      setChild(null);
      if (!childId.trim()) {
        setSearchErr("Enter Child ID");
        return;
      }
      setSearching(true);

      // ✔ use the route we created on the backend
      const { data } = await axios.get(`${API}/medical-records/child/${childId}`);
      // if you prefer the children route, use:  `${API}/children/${childId}`
      setChild(data);
    } catch (e) {
      setSearchErr("Child not found with this ID");
    } finally {
      setSearching(false);
    }
  };

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: "" }));
  };

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

  const submit = async (e) => {
    e.preventDefault();
    if (!child) {
      alert("Search and select a valid child first");
      return;
    }
    if (!validateForm()) return;

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("child_id", child.child_id);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v || ""));
      if (file) fd.append("attachment", file);

      // ✔ correct endpoint, let Axios set headers for FormData
      await axios.post(`${API}/medical-records`, fd);

      nav("/MedicalRecords");
    } catch (error) {
      console.error("Error saving medical record:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Error saving medical record. Please try again.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const clearForm = () => {
    setForm({
      visit_date: "",
      doctor_name: "",
      diagnosis: "",
      prescription: "",
      treatment: "",
      notes: "",
    });
    setFile(null);
    setPreview(null);
    setErrors({});
  };

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <span className="breadcrumb-item">Dashboard</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item">Medical Records</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item active">New Record</span>
      </nav>

      {/* Main Card */}
      <div className="form-card">
        {/* Header */}
        <div className="form-header">
          <div className="form-title-section">
            <div className="form-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="form-title">MEDICAL RECORD FORM</h1>
              <p className="form-subtitle">Complete all mandatory fields marked with asterisk (*)</p>
            </div>
          </div>
          <div className="form-meta">
            <div className="form-date">Date: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div className="registration-form">
          {/* Section A: Child Search */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon" />
              <div>
                <h2 className="section-title">SECTION A: CHILD IDENTIFICATION</h2>
                <p className="section-subtitle">Search and verify the child's information</p>
              </div>
            </div>

            <div className="search-container">
              <div className="form-group">
                <label className="form-label">
                  CHILD ID <span className="required">*</span>
                </label>
                <div className="search-input-group">
                  <div className="input-wrapper">
                    <input
                      className="form-input"
                      placeholder="Enter child ID"
                      value={childId}
                      onChange={(e) => setChildId(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && findChild()}
                    />
                  </div>
                  <button type="button" className="search-btn" onClick={findChild} disabled={searching}>
                    {searching ? "Searching..." : "Search"}
                  </button>
                </div>
                {searchErr && <span className="error-text">{searchErr}</span>}
              </div>

              {child && (
                <div className="child-info-card">
                  <div className="child-info-header">
                    <div className="child-info-icon">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3>Child Information Verified</h3>
                  </div>
                  <div className="child-info-grid">
                    <div className="child-info-item">
                      <span className="info-label">Full Name:</span>
                      <span className="info-value">{child.name || `${child.first_name} ${child.last_name}`}</span>
                    </div>
                    <div className="child-info-item">
                      <span className="info-label">Date of Birth:</span>
                      <span className="info-value">
                        {child.dob ? new Date(child.dob).toLocaleDateString() : "-"}
                      </span>
                    </div>
                    <div className="child-info-item">
                      <span className="info-label">Contact:</span>
                      <span className="info-value">{child.email || child.parent_email || "Not provided"}</span>
                    </div>
                    <div className="child-info-item">
                      <span className="info-label">Child ID:</span>
                      <span className="info-value">{child.child_id}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section B: Medical Information */}
          <form onSubmit={submit}>
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon" />
                <div>
                  <h2 className="section-title">SECTION B: MEDICAL INFORMATION</h2>
                  <p className="section-subtitle">Enter the medical examination details</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    VISIT DATE <span className="required">*</span>
                  </label>
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

                <div className="form-group">
                  <label className="form-label">
                    DOCTOR NAME <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      className={`form-input ${errors.doctor_name ? "error" : ""}`}
                      placeholder="Dr. John Doe"
                      value={form.doctor_name}
                      onChange={(e) => set("doctor_name", e.target.value)}
                    />
                  </div>
                  {errors.doctor_name && <span className="error-text">{errors.doctor_name}</span>}
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">
                    DIAGNOSIS <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <textarea
                      className={`form-textarea ${errors.diagnosis ? "error" : ""}`}
                      placeholder="Enter diagnosis"
                      value={form.diagnosis}
                      onChange={(e) => set("diagnosis", e.target.value)}
                      rows={3}
                    />
                  </div>
                  {errors.diagnosis && <span className="error-text">{errors.diagnosis}</span>}
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">TREATMENT PLAN</label>
                  <div className="input-wrapper">
                    <textarea
                      className="form-textarea"
                      placeholder="Treatment details"
                      value={form.treatment}
                      onChange={(e) => set("treatment", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">PRESCRIPTION DETAILS</label>
                  <div className="input-wrapper">
                    <textarea
                      className="form-textarea"
                      placeholder="Medications, dosage, instructions"
                      value={form.prescription}
                      onChange={(e) => set("prescription", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">ADDITIONAL NOTES</label>
                  <div className="input-wrapper">
                    <textarea
                      className="form-textarea"
                      placeholder="Observations or follow-up"
                      value={form.notes}
                      onChange={(e) => set("notes", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section C: Attachments */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon" />
                <div>
                  <h2 className="section-title">SECTION C: DOCUMENT ATTACHMENTS</h2>
                  <p className="section-subtitle">Attach relevant reports (optional)</p>
                </div>
              </div>

              <div className="attachment-section">
                <div className="attachment-upload-container">
                  <div className="attachment-upload-area" onClick={() => fileRef.current?.click()}>
                    {file ? (
                      <div className="file-preview">
                        {preview ? (
                          <img src={preview} alt="Preview" className="image-preview" />
                        ) : (
                          <div className="file-info">
                            <div className="file-name">{file.name}</div>
                            <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="attachment-placeholder">
                        <div className="upload-text">
                          <div>Click to attach document</div>
                          <div className="upload-subtext">PDF, DOC, or Image files</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="attachment-controls">
                    <button type="button" className="attach-btn" onClick={() => fileRef.current?.click()}>
                      {file ? "CHANGE FILE" : "ATTACH DOCUMENT"}
                    </button>
                    {file && (
                      <button type="button" className="remove-btn" onClick={() => { setFile(null); setPreview(null); }}>
                        REMOVE FILE
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

            {/* Form Actions */}
            <div className="form-actions">
              <button type="button" className="btn btn-tertiary" onClick={clearForm} disabled={saving}>
                Clear Form
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => nav("/MedicalRecords")} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving || !child}>
                {saving ? "Processing..." : "Save Medical Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
