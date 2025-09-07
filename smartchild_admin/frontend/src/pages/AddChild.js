import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/addchild.css";

const API = "http://localhost:5000";

export default function AddChild() {
  const [form, setForm] = useState({
    first_name: "", last_name: "", dob: "", gender: "",
    birth_weight: "", blood_type: "", parent_name: "", parent_nic: "",
    contact_no: "", email: "", address: "", username: "", password: ""
  });
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef();
  const nav = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.first_name.trim()) newErrors.first_name = "First name is required";
    if (!form.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!form.dob) newErrors.dob = "Date of birth is required";
    if (!form.gender) newErrors.gender = "Gender is required";
    if (!form.parent_name.trim()) newErrors.parent_name = "Parent name is required";
    if (!form.parent_nic.trim()) newErrors.parent_nic = "Parent NIC is required";
    if (!form.contact_no.trim()) newErrors.contact_no = "Contact number is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email is invalid";
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.password.trim()) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      if (file) fd.append("child_image", file);
      
      await axios.post(`${API}/api/children`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      nav("/children");
    } catch (error) {
      console.error("Error adding child:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) {
      setErrors(prev => ({ ...prev, [k]: "" }));
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
        <span className="breadcrumb-item">Children Management</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item active">New Registration</span>
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
              <h1 className="form-title">CHILD REGISTRATION FORM</h1>
              <p className="form-subtitle">Complete all mandatory fields marked with asterisk (*)</p>
            </div>
          </div>
          <div className="form-meta">
            <div className="form-id">Form ID: CR-2025-001</div>
            <div className="form-date">Date: 9/1/2025</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="registration-form">
          {/* Photo Upload Section */}
          <div className="photo-section">
            <div className="section-header">
              <div className="section-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="section-title">PHOTOGRAPH ATTACHMENT</h2>
            </div>
            
            <div className="photo-upload-container">
              <div className="photo-upload-area" onClick={triggerFileUpload}>
                {preview ? (
                  <img src={preview} alt="Child preview" className="photo-preview" />
                ) : (
                  <div className="photo-placeholder">
                    <svg className="camera-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="photo-controls">
                <button type="button" className="attach-btn" onClick={triggerFileUpload}>
                  ATTACH PHOTO
                </button>
                <div className="photo-requirements">
                  <div className="requirement-title">Requirements:</div>
                  <div className="requirement-item">• Format: JPEG, PNG</div>
                  <div className="requirement-item">• Size: Maximum 5MB</div>
                  <div className="requirement-item">• Dimensions: 400x400 pixels recommended</div>
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

          {/* Section A: Child Personal Information */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">SECTION A: CHILD PERSONAL INFORMATION</h2>
              <p className="section-subtitle">Enter the child's basic personal details</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">FIRST NAME <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    className={`form-input ${errors.first_name ? 'error' : ''}`}
                    placeholder="Enter first name"
                    value={form.first_name}
                    onChange={e => set("first_name", e.target.value)}
                  />
                </div>
                {errors.first_name && <span className="error-text">{errors.first_name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">LAST NAME <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    className={`form-input ${errors.last_name ? 'error' : ''}`}
                    placeholder="Enter last name"
                    value={form.last_name}
                    onChange={e => set("last_name", e.target.value)}
                  />
                </div>
                {errors.last_name && <span className="error-text">{errors.last_name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">DATE OF BIRTH <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input
                    className={`form-input ${errors.dob ? 'error' : ''}`}
                    type="date"
                    value={form.dob}
                    onChange={e => set("dob", e.target.value)}
                  />
                </div>
                {errors.dob && <span className="error-text">{errors.dob}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">GENDER <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <select
                    className={`form-select ${errors.gender ? 'error' : ''}`}
                    value={form.gender}
                    onChange={e => set("gender", e.target.value)}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                {errors.gender && <span className="error-text">{errors.gender}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">BIRTH WEIGHT (KG)</label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <input
                    className="form-input"
                    placeholder="Enter birth weight"
                    value={form.birth_weight}
                    onChange={e => set("birth_weight", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">BLOOD TYPE</label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <select
                    className="form-select"
                    value={form.blood_type}
                    onChange={e => set("blood_type", e.target.value)}
                  >
                    <option value="">Select blood type</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Parent Information */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">SECTION B: PARENT/GUARDIAN INFORMATION</h2>
              <p className="section-subtitle">Enter parent or guardian contact details</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">PARENT NAME <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    className={`form-input ${errors.parent_name ? 'error' : ''}`}
                    placeholder="Enter parent name"
                    value={form.parent_name}
                    onChange={e => set("parent_name", e.target.value)}
                  />
                </div>
                {errors.parent_name && <span className="error-text">{errors.parent_name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">PARENT NIC <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  <input
                    className={`form-input ${errors.parent_nic ? 'error' : ''}`}
                    placeholder="Enter NIC number"
                    value={form.parent_nic}
                    onChange={e => set("parent_nic", e.target.value)}
                  />
                </div>
                {errors.parent_nic && <span className="error-text">{errors.parent_nic}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">CONTACT NUMBER <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <input
                    className={`form-input ${errors.contact_no ? 'error' : ''}`}
                    placeholder="Enter contact number"
                    value={form.contact_no}
                    onChange={e => set("contact_no", e.target.value)}
                  />
                </div>
                {errors.contact_no && <span className="error-text">{errors.contact_no}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">EMAIL ADDRESS <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    type="email"
                    placeholder="Enter email address"
                    value={form.email}
                    onChange={e => set("email", e.target.value)}
                  />
                </div>
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group form-group-full">
                <label className="form-label">ADDRESS</label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <textarea
                    className="form-textarea"
                    placeholder="Enter full address"
                    value={form.address}
                    onChange={e => set("address", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section C: Account Information */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">SECTION C: ACCOUNT INFORMATION</h2>
              <p className="section-subtitle">Create login credentials for the child's account</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">USERNAME <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    className={`form-input ${errors.username ? 'error' : ''}`}
                    placeholder="Enter username"
                    value={form.username}
                    onChange={e => set("username", e.target.value)}
                  />
                </div>
                {errors.username && <span className="error-text">{errors.username}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">PASSWORD <span className="required">*</span></label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    type="password"
                    placeholder="Enter password"
                    value={form.password}
                    onChange={e => set("password", e.target.value)}
                  />
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => nav("/children")}
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
                  Processing...
                </>
              ) : (
                "Register Child"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}