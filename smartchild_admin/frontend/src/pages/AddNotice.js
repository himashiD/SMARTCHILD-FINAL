import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/addnotice.css";

const API = "http://localhost:5000";

export default function AddNotice() {
  const [form, setForm] = useState({
    notice_title: "",
    notice_description: "",
    notice_date: "",
    notice_start_time: "",
    notice_end_time: "",
    notice_venue: ""
  });
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef();
  const nav = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.notice_title.trim()) newErrors.notice_title = "Notice title is required";
    if (!form.notice_date.trim()) newErrors.notice_date = "Notice date is required";
    if (!form.notice_start_time.trim()) newErrors.notice_start_time = "Start time is required";
    if (!form.notice_end_time.trim()) newErrors.notice_end_time = "End time is required";
    if (!form.notice_venue.trim()) newErrors.notice_venue = "Venue is required";
    if (!form.notice_description.trim()) newErrors.notice_description = "Description is required";

    // Validate date format
    if (form.notice_date && !/^\d{4}-\d{2}-\d{2}$/.test(form.notice_date)) {
      newErrors.notice_date = "Date must be in YYYY-MM-DD format";
    }

    // Validate time sequence
    if (form.notice_start_time && form.notice_end_time && form.notice_start_time >= form.notice_end_time) {
      newErrors.notice_end_time = "End time must be after start time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    // Clear error when user starts typing
    if (errors[k]) {
      setErrors(prev => ({ ...prev, [k]: "" }));
    }
  };

  const onFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f) {
      const r = new FileReader();
      r.onload = () => setPreview(r.result);
      r.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("notice_image", file);

      await axios.post(`${API}/api/notices`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      nav("/notices");
    } catch (error) {
      console.error("Error adding notice:", error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileUpload = () => {
    fileRef.current?.click();
  };

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <span className="breadcrumb-item">Dashboard</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item">Notice Management</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item active">Add New Notice</span>
      </nav>

      {/* Main Card */}
      <div className="form-card">
        {/* Header */}
        <div className="form-header">
          <div className="form-title-section">
            <div className="form-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div>
              <h1 className="form-title">ADD NOTICE </h1>
              <p className="form-subtitle">Add new notice information to the system</p>
            </div>
          </div>
          <div className="form-meta">
            <div className="form-id">Form ID: NR-2025-001</div>
            <div className="form-date">Date: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="registration-form">
          {/* Notice Image Section */}
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
                {preview ? (
                  <img src={preview} alt="Notice preview" className="photo-preview" />
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
                  ATTACH IMAGE
                </button>
                <div className="photo-requirements">
                  <div className="requirement-title">Requirements:</div>
                  <div className="requirement-item">• Format: JPEG, PNG</div>
                  <div className="requirement-item">• Size: Maximum 5MB</div>
                  <div className="requirement-item">• Clear notice or announcement image</div>
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

          {/* Section A: Notice Information */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">SECTION A: NOTICE INFORMATION</h2>
              <p className="section-subtitle">Enter the notice details and specifications</p>
            </div>

            <div className="form-grid">
              <div className="form-group form-group-full">
                <label className="form-label">NOTICE TITLE <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                  <input
                    className={`form-input ${errors.notice_title ? 'error' : ''}`}
                    placeholder="Enter notice title (e.g., Health Checkup, Vaccination Drive)"
                    value={form.notice_title}
                    onChange={e => set("notice_title", e.target.value)}
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
                    className={`form-input ${errors.notice_date ? 'error' : ''}`}
                    type="date"
                    value={form.notice_date}
                    onChange={e => set("notice_date", e.target.value)}
                  />
                </div>
                {errors.notice_date && <span className="error-text">{errors.notice_date}</span>}
                <div className="form-note">
                  Select the date when this notice will be active
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">VENUE <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    className={`form-input ${errors.notice_venue ? 'error' : ''}`}
                    placeholder="Enter venue location (e.g., Main Hall, Clinic Room A)"
                    value={form.notice_venue}
                    onChange={e => set("notice_venue", e.target.value)}
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
                    className={`form-input ${errors.notice_start_time ? 'error' : ''}`}
                    type="time"
                    value={form.notice_start_time}
                    onChange={e => set("notice_start_time", e.target.value)}
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
                    className={`form-input ${errors.notice_end_time ? 'error' : ''}`}
                    type="time"
                    value={form.notice_end_time}
                    onChange={e => set("notice_end_time", e.target.value)}
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
                    className={`form-textarea ${errors.notice_description ? 'error' : ''}`}
                    placeholder="Enter notice description, purpose, requirements, and any important details..."
                    value={form.notice_description}
                    onChange={e => set("notice_description", e.target.value)}
                    rows={4}
                  />
                </div>
                {errors.notice_description && <span className="error-text">{errors.notice_description}</span>}
              </div>
            </div>
          </div>

          {/* Section B: Notice Guidelines */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">SECTION B: NOTICE GUIDELINES</h2>
              <p className="section-subtitle">Important notice publication and management guidelines</p>
            </div>

            <div className="guidelines-container">
              <div className="guideline-item">
                <div className="guideline-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="guideline-content">
                  <div className="guideline-title">Clear Communication</div>
                  <div className="guideline-text">Ensure notice title and description are clear and easily understood</div>
                </div>
              </div>

              <div className="guideline-item">
                <div className="guideline-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="guideline-content">
                  <div className="guideline-title">Advance Notice</div>
                  <div className="guideline-text">Publish notices at least 24-48 hours before the event for proper planning</div>
                </div>
              </div>

              <div className="guideline-item">
                <div className="guideline-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="guideline-content">
                  <div className="guideline-title">Time Management</div>
                  <div className="guideline-text">Verify start and end times are accurate and allow sufficient duration</div>
                </div>
              </div>

              <div className="guideline-item">
                <div className="guideline-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="guideline-content">
                  <div className="guideline-title">Venue Confirmation</div>
                  <div className="guideline-text">Confirm venue availability and accessibility before publishing notice</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => nav("/notices")}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="loading-spinner" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Adding Notice...
                </>
              ) : (
                <>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Notice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}