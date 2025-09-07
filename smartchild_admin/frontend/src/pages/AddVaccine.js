import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/addvaccine.css";

const API = "http://localhost:5000";

export default function AddVaccine() {
  const [form, setForm] = useState({ 
    name: "", 
    dose: "", 
    age_weeks: "", 
    description: "" 
  });
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef();
  const nav = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) newErrors.name = "Vaccine name is required";
    if (!form.dose.trim()) newErrors.dose = "Dose information is required";
    if (!form.age_weeks.trim()) newErrors.age_weeks = "Age in weeks is required";
    else if (isNaN(Number(form.age_weeks)) || Number(form.age_weeks) < 0) {
      newErrors.age_weeks = "Age must be a valid positive number";
    }
    if (!form.description.trim()) newErrors.description = "Description is required";

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
      if (file) fd.append("vaccine_image", file);

      await axios.post(`${API}/api/vaccines`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      nav("/vaccines");
    } catch (error) {
      console.error("Error adding vaccine:", error);
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
        <span className="breadcrumb-item">Vaccination Management</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item active">Add New Vaccine</span>
      </nav>

      {/* Main Card */}
      <div className="form-card">
        {/* Header */}
        <div className="form-header">
          <div className="form-title-section">
            <div className="form-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h1 className="form-title">VACCINATION REGISTRATION FORM</h1>
              <p className="form-subtitle">Add new vaccine information to the system</p>
            </div>
          </div>
          <div className="form-meta">
            <div className="form-id">Form ID: VR-2025-001</div>
            <div className="form-date">Date: 9/1/2025</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="registration-form">
          {/* Vaccine Image Section */}
          <div className="photo-section">
            <div className="section-header">
              <div className="section-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="section-title">VACCINE IMAGE ATTACHMENT</h2>
            </div>
            
            <div className="photo-upload-container">
              <div className="photo-upload-area" onClick={triggerFileUpload}>
                {preview ? (
                  <img src={preview} alt="Vaccine preview" className="photo-preview" />
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
                  <div className="requirement-item">• Clear vaccine vial or package image</div>
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

          {/* Section A: Vaccine Information */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">SECTION A: VACCINE INFORMATION</h2>
              <p className="section-subtitle">Enter the vaccine details and specifications</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">VACCINE NAME <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                  </svg>
                  <input
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="Enter vaccine name (e.g., BCG, Polio, DPT)"
                    value={form.name}
                    onChange={e => set("name", e.target.value)}
                  />
                </div>
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">DOSE INFORMATION <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <select
                    className={`form-select ${errors.dose ? 'error' : ''}`}
                    value={form.dose}
                    onChange={e => set("dose", e.target.value)}
                  >
                    <option value="">Select dose type</option>
                    <option value="1st Dose">1st Dose</option>
                    <option value="2nd Dose">2nd Dose</option>
                    <option value="3rd Dose">3rd Dose</option>
                    <option value="4th Dose">4th Dose</option>
                    <option value="5th Dose">5th Dose</option>
                    <option value="Booster">Booster</option>
                    <option value="Single Dose">Single Dose</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
                {errors.dose && <span className="error-text">{errors.dose}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">AGE IN WEEKS <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input
                    className={`form-input ${errors.age_weeks ? 'error' : ''}`}
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Enter age in weeks (e.g., 6, 10, 14)"
                    value={form.age_weeks}
                    onChange={e => set("age_weeks", e.target.value)}
                  />
                </div>
                {errors.age_weeks && <span className="error-text">{errors.age_weeks}</span>}
                <div className="form-note">
                  Enter the recommended age for this vaccination in weeks
                </div>
              </div>

              <div className="form-group form-group-full">
                <label className="form-label">DESCRIPTION & NOTES <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon textarea-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <textarea
                    className={`form-textarea ${errors.description ? 'error' : ''}`}
                    placeholder="Enter vaccine description, purpose, side effects, and any important notes..."
                    value={form.description}
                    onChange={e => set("description", e.target.value)}
                    rows={4}
                  />
                </div>
                {errors.description && <span className="error-text">{errors.description}</span>}
              </div>
            </div>
          </div>

          {/* Section B: Medical Guidelines */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">SECTION B: MEDICAL GUIDELINES</h2>
              <p className="section-subtitle">Important vaccination administration guidelines</p>
            </div>

            <div className="guidelines-container">
              <div className="guideline-item">
                <div className="guideline-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="guideline-content">
                  <div className="guideline-title">Pre-vaccination Screening</div>
                  <div className="guideline-text">Ensure child is healthy and fever-free before administration</div>
                </div>
              </div>

              <div className="guideline-item">
                <div className="guideline-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="guideline-content">
                  <div className="guideline-title">Proper Storage</div>
                  <div className="guideline-text">Maintain cold chain storage between 2-8°C until administration</div>
                </div>
              </div>

              <div className="guideline-item">
                <div className="guideline-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="guideline-content">
                  <div className="guideline-title">Observation Period</div>
                  <div className="guideline-text">Monitor child for 15-30 minutes post-vaccination for adverse reactions</div>
                </div>
              </div>

              <div className="guideline-item">
                <div className="guideline-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="guideline-content">
                  <div className="guideline-title">Documentation</div>
                  <div className="guideline-text">Record vaccination details in child's immunization card and system</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => nav("/vaccines")}
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
                  Adding Vaccine...
                </>
              ) : (
                <>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Vaccine
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}